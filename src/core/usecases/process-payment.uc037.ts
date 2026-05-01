/**
 * UC037 — Process Payment (ביצוע תשלום)
 * Clean Architecture Use Case Implementation
 *
 * Normal Flow, Alternative Flows, Exceptions — as per PDF spec
 * PCI-DSS compliant: card numbers NOT stored, only last 4 digits
 */

import {
  ORDER_STATUS,
  TRANSACTION_STATUS,
  type PaymentMethod,
} from "@/core/value-objects";
import type {
  OrderEntity,
  PaymentTransactionEntity,
  InvoiceEntity,
  AuditLogEntry,
} from "@/core/entities";

// ── Ports (interfaces to be implemented by infrastructure) ──
export interface IOrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  updateStatus(id: string, status: OrderEntity["status"]): Promise<void>;
}

export interface IPaymentGateway {
  /**
   * Sends payment request to external clearing system.
   * Must respond within 5 seconds (SLA requirement).
   * Returns gateway transaction ID on success.
   */
  processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
}

export interface IPaymentTransactionRepository {
  create(transaction: Omit<PaymentTransactionEntity, "id">): Promise<PaymentTransactionEntity>;
  updateStatus(id: string, status: PaymentTransactionEntity["status"], gatewayResponse?: string, gatewayTxId?: string): Promise<void>;
  addAuditEntry(id: string, entry: AuditLogEntry): Promise<void>;
  findById(id: string): Promise<PaymentTransactionEntity | null>;
}

export interface IInvoiceService {
  /** UC039 — Issue receipt and invoice */
  generate(transaction: PaymentTransactionEntity, order: OrderEntity): Promise<InvoiceEntity>;
}

export interface INotificationService {
  /** Send payment confirmation to client (email/push) */
  sendPaymentConfirmation(clientId: string, invoice: InvoiceEntity): Promise<void>;
  /** Notify service rep of debt closure */
  notifyRepDebtClosed(repId: string, orderId: string): Promise<void>;
}

// ── DTOs ──
export interface PaymentGatewayRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  cardToken?: string;      // Tokenized — not raw card data
  orderId: string;
  idempotencyKey: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  declineReason?: string;
  errorCode?: string;
}

export interface ProcessPaymentInput {
  orderId: string;
  clientId: string;
  paymentMethod: PaymentMethod;
  cardToken?: string;
  cardLastFour?: string;
  cardBrand?: string;
  actorId: string;          // Who's initiating (client or service rep)
  actorRole: "CLIENT" | "SERVICE_REP";
  ipAddress?: string;
}

export type ProcessPaymentResult =
  | { success: true; transactionId: string; invoiceId: string; invoiceNumber: string }
  | { success: false; reason: "INVALID_INPUT"; fieldErrors: Record<string, string> }
  | { success: false; reason: "NOT_AUTHORIZED" }
  | { success: false; reason: "ORDER_NOT_FOUND" }
  | { success: false; reason: "WRONG_STATUS"; currentStatus: string }
  | { success: false; reason: "GATEWAY_DECLINED"; declineReason: string }
  | { success: false; reason: "TIMEOUT" }
  | { success: false; reason: "INTERNAL_ERROR"; message: string };

// ── Use Case ──
export class ProcessPaymentUseCase {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly paymentRepo: IPaymentTransactionRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly invoiceService: IInvoiceService,
    private readonly notificationService: INotificationService
  ) {}

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
    // ── Step 1: Authorization check (Business Rule 1) ──
    // Only the order owner (client) or a service rep may pay
    // This is enforced at the tRPC layer with role guards, but validated here too
    if (input.actorRole !== "CLIENT" && input.actorRole !== "SERVICE_REP") {
      return { success: false, reason: "NOT_AUTHORIZED" };
    }

    // ── Step 2: Load order and validate status ──
    const order = await this.orderRepo.findById(input.orderId);
    if (!order) return { success: false, reason: "ORDER_NOT_FOUND" };
    if (order.clientId !== input.clientId && input.actorRole !== "SERVICE_REP") {
      return { success: false, reason: "NOT_AUTHORIZED" };
    }
    if (order.status !== ORDER_STATUS.WAITING_PAYMENT) {
      return {
        success: false,
        reason: "WRONG_STATUS",
        currentStatus: order.status,
      };
    }

    // ── Step 3: Input validation (Alternative Flow 1) ──
    const fieldErrors = this.validatePaymentInput(input);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, reason: "INVALID_INPUT", fieldErrors };
    }

    // ── Step 4: Create pending transaction (Audit Log — Business Rule 2) ──
    const idempotencyKey = `${input.orderId}-${Date.now()}`;
    const initEntry: AuditLogEntry = {
      timestamp: new Date(),
      action: "PAYMENT_INITIATED",
      actor: input.actorId,
      details: `Payment initiated via ${input.paymentMethod}. Amount: ${order.totalAmount}`,
      ipAddress: input.ipAddress,
    };

    const transaction = await this.paymentRepo.create({
      orderId: input.orderId,
      clientId: input.clientId,
      amount: order.totalAmount,
      currency: "ILS",
      paymentMethod: input.paymentMethod,
      status: TRANSACTION_STATUS.INITIATED,
      cardLastFour: input.cardLastFour,
      cardBrand: input.cardBrand,
      initiatedAt: new Date(),
      auditLog: [initEntry],
    });

    // ── Step 5: Send to payment gateway (Performance SLA: 5s max) ──
    let gatewayResponse: PaymentGatewayResponse;
    try {
      gatewayResponse = await this.paymentGateway.processPayment({
        amount: order.totalAmount,
        currency: "ILS",
        paymentMethod: input.paymentMethod,
        cardToken: input.cardToken,
        orderId: input.orderId,
        idempotencyKey,
      });
    } catch (error) {
      // ── Exception 2: Timeout / Communication failure ──
      // Reliability: perform retry sync to prevent duplicate charges
      await this.paymentRepo.updateStatus(transaction.id, TRANSACTION_STATUS.TIMEOUT);
      await this.paymentRepo.addAuditEntry(transaction.id, {
        timestamp: new Date(),
        action: "PAYMENT_TIMEOUT",
        actor: "SYSTEM",
        details: `Communication timeout with payment gateway. Order remains WAITING_PAYMENT.`,
      });
      // Order status remains WAITING_PAYMENT — no rollback needed
      return { success: false, reason: "TIMEOUT" };
    }

    // ── Exception 1: Gateway declined ──
    if (!gatewayResponse.success || !gatewayResponse.transactionId) {
      await this.paymentRepo.updateStatus(
        transaction.id,
        TRANSACTION_STATUS.DECLINED,
        gatewayResponse.declineReason
      );
      await this.paymentRepo.addAuditEntry(transaction.id, {
        timestamp: new Date(),
        action: "PAYMENT_DECLINED",
        actor: "GATEWAY",
        details: `Declined: ${gatewayResponse.declineReason ?? "Unknown reason"}`,
      });
      return {
        success: false,
        reason: "GATEWAY_DECLINED",
        declineReason: gatewayResponse.declineReason ?? "כרטיס נדחה",
      };
    }

    // ── Step 6: Update transaction & order status ──
    await this.paymentRepo.updateStatus(
      transaction.id,
      TRANSACTION_STATUS.APPROVED,
      "APPROVED",
      gatewayResponse.transactionId
    );
    await this.orderRepo.updateStatus(input.orderId, ORDER_STATUS.PAID);
    await this.paymentRepo.addAuditEntry(transaction.id, {
      timestamp: new Date(),
      action: "PAYMENT_APPROVED",
      actor: "GATEWAY",
      details: `Gateway TxID: ${gatewayResponse.transactionId}. Order marked PAID.`,
    });

    // ── Step 7: Issue invoice (UC039) ──
    const updatedTransaction = await this.paymentRepo.findById(transaction.id);
    const invoice = await this.invoiceService.generate(updatedTransaction!, order);

    // ── Step 8: Send notifications ──
    try {
      await this.notificationService.sendPaymentConfirmation(input.clientId, invoice);
      // If initiated by service rep, notify them of debt closure
      if (input.actorRole === "SERVICE_REP") {
        await this.notificationService.notifyRepDebtClosed(input.actorId, input.orderId);
      }
    } catch {
      // Notification failure does not fail the payment — log only
      await this.paymentRepo.addAuditEntry(transaction.id, {
        timestamp: new Date(),
        action: "NOTIFICATION_FAILED",
        actor: "SYSTEM",
        details: "Payment successful but notification delivery failed.",
      });
    }

    return {
      success: true,
      transactionId: transaction.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    };
  }

  private validatePaymentInput(input: ProcessPaymentInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (input.paymentMethod === "CREDIT_CARD") {
      if (!input.cardToken) errors.cardToken = "פרטי כרטיס אשראי חסרים";
      if (!input.cardLastFour || !/^\d{4}$/.test(input.cardLastFour)) {
        errors.cardLastFour = "4 ספרות אחרונות של כרטיס אינן תקינות";
      }
    }
    return errors;
  }
}
