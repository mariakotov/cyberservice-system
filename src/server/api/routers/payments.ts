/**
 * Payments tRPC Router — UC037 (Process Payment)
 * UC038 (Subscription billing), UC039 (Invoice), UC040 (Refund), UC041 (History)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, roleGuard } from "../trpc";
import { db, initializeDatabase, seedDatabase } from "@/infrastructure/db/client";
import { orders, paymentTransactions, invoices } from "@/infrastructure/db/schema";
import { eq, desc } from "drizzle-orm";
import { ProcessPaymentUseCase } from "@/core/usecases/process-payment.uc037";
import { mockPaymentGateway } from "@/infrastructure/services/mock-payment-gateway";
import { randomUUID } from "crypto";

// ── Infrastructure adapters ──────────────────

class DrizzleOrderRepository {
  async findById(id: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return null;
    return {
      ...order,
      status: order.status as any,
      totalAmount: order.totalAmount,
    };
  }
  async updateStatus(id: string, status: string) {
    await db.update(orders)
      .set({ status: status as any, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id));
  }
}

class DrizzlePaymentTransactionRepository {
  async create(data: any) {
    const id = randomUUID();
    await db.insert(paymentTransactions).values({
      id,
      orderId: data.orderId,
      clientId: data.clientId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      status: data.status,
      cardLastFour: data.cardLastFour ?? null,
      cardBrand: data.cardBrand ?? null,
      auditLog: JSON.stringify(data.auditLog ?? []),
    });
    return { ...data, id };
  }
  async updateStatus(id: string, status: string, gatewayResponse?: string, gatewayTxId?: string) {
    await db.update(paymentTransactions)
      .set({
        status: status as any,
        gatewayResponse: gatewayResponse ?? null,
        gatewayTransactionId: gatewayTxId ?? null,
        completedAt: ["APPROVED","DECLINED"].includes(status) ? new Date().toISOString() : undefined,
      })
      .where(eq(paymentTransactions.id, id));
  }
  async addAuditEntry(id: string, entry: any) {
    const [tx] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    if (!tx) return;
    const log = JSON.parse(tx.auditLog as unknown as string ?? "[]");
    log.push(entry);
    await db.update(paymentTransactions)
      .set({ auditLog: JSON.stringify(log) as any })
      .where(eq(paymentTransactions.id, id));
  }
  async findById(id: string) {
    const [tx] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    return tx ?? null;
  }
}

class MockInvoiceService {
  async generate(transaction: any, order: any) {
    const id = randomUUID();
    const invoiceNumber = `INV-${Date.now()}`;
    const subtotal = transaction.amount;
    const tax = Math.round(subtotal * 0.17 * 100) / 100; // 17% VAT
    const total = subtotal + tax;
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString();

    await db.insert(invoices).values({
      id,
      invoiceNumber,
      orderId: order.id,
      paymentTransactionId: transaction.id,
      clientId: order.clientId,
      lineItems: JSON.stringify([{
        description: `שירות #${order.orderNumber}`,
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
      }]) as any,
      subtotal,
      tax,
      total,
      currency: "ILS",
      dueDate,
    });

    return { id, invoiceNumber, subtotal, tax, total, dueDate };
  }
}

class MockNotificationService {
  async sendPaymentConfirmation(clientId: string, invoice: any) {
    console.log(`[NOTIFICATION] Payment confirmation sent to client ${clientId}, Invoice: ${invoice.invoiceNumber}`);
  }
  async notifyRepDebtClosed(repId: string, orderId: string) {
    console.log(`[NOTIFICATION] Service rep ${repId} notified: debt closed for order ${orderId}`);
  }
}

// ── Router ─────────────────────────────────────

export const paymentsRouter = router({

  // UC037 — Process Payment
  processPayment: protectedProcedure
    .input(z.object({
      orderId: z.string().uuid(),
      paymentMethod: z.enum(["CREDIT_CARD", "BANK_TRANSFER", "CHECK"]),
      cardToken: z.string().optional(),
      cardLastFour: z.string().length(4).optional(),
      cardBrand: z.string().optional(),
      // Simulation mode for demo
      simulationScenario: z.enum(["success", "decline", "timeout", "random"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      initializeDatabase();
      await seedDatabase();

      const session = ctx.session!;
      const user = session.user as any;

      // Override gateway scenario for demo
      if (input.simulationScenario) {
        (mockPaymentGateway as any).scenario = input.simulationScenario;
      }

      const useCase = new ProcessPaymentUseCase(
        new DrizzleOrderRepository(),
        new DrizzlePaymentTransactionRepository(),
        mockPaymentGateway,
        new MockInvoiceService(),
        new MockNotificationService()
      );

      const result = await useCase.execute({
        orderId: input.orderId,
        clientId: user.id ?? user.email,
        paymentMethod: input.paymentMethod,
        cardToken: input.cardToken,
        cardLastFour: input.cardLastFour,
        cardBrand: input.cardBrand,
        actorId: user.id ?? user.email,
        actorRole: user.role === "SERVICE_REP" ? "SERVICE_REP" : "CLIENT",
        ipAddress: "127.0.0.1", // In prod: get from request headers
      });

      if (!result.success) {
        throw new TRPCError({
          code: result.reason === "NOT_AUTHORIZED" ? "FORBIDDEN"
              : result.reason === "ORDER_NOT_FOUND" ? "NOT_FOUND"
              : "BAD_REQUEST",
          message: result.reason,
          cause: result,
        });
      }

      return result;
    }),

  // UC041 — View billing history
  getBillingHistory: protectedProcedure
    .input(z.object({ clientId: z.string().optional() }))
    .query(async ({ ctx }) => {
      initializeDatabase();
      await seedDatabase();
      const user = ctx.session!.user as any;
      const clientId = user.id ?? user.email;

      const txs = await db.select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.clientId, clientId))
        .orderBy(desc(paymentTransactions.initiatedAt))
        .limit(50);

      return txs.map(tx => ({
        ...tx,
        auditLog: JSON.parse(tx.auditLog as unknown as string ?? "[]"),
      }));
    }),

  // UC039 — Get invoices
  getInvoices: protectedProcedure.query(async ({ ctx }) => {
    initializeDatabase();
    await seedDatabase();
    const user = ctx.session!.user as any;
    const clientId = user.id ?? user.email;

    return db.select()
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.issuedAt))
      .limit(20);
  }),

  // Dashboard stats for payments panel
  getPaymentStats: protectedProcedure.query(async ({ ctx }) => {
    initializeDatabase();
    await seedDatabase();
    const user = ctx.session!.user as any;

    const allOrders = await db.select().from(orders);
    const allTxs = await db.select().from(paymentTransactions);

    const total = allTxs
      .filter(t => t.status === "APPROVED")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue: total,
      pendingPayments: allOrders.filter(o => o.status === "WAITING_PAYMENT").length,
      completedTransactions: allTxs.filter(t => t.status === "APPROVED").length,
      declinedTransactions: allTxs.filter(t => t.status === "DECLINED").length,
    };
  }),

  // UC037 — Get orders pending payment
  getPendingOrders: protectedProcedure.query(async ({ ctx }) => {
    initializeDatabase();
    await seedDatabase();
    return db.select()
      .from(orders)
      .where(eq(orders.status, "WAITING_PAYMENT"))
      .limit(20);
  }),
});
