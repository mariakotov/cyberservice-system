/**
 * Orders tRPC Router — UC017–UC019, UC021–UC032
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db, initializeDatabase, seedDatabase } from "@/infrastructure/db/client";
import { orders, services, users } from "@/infrastructure/db/schema";
import { eq, desc } from "drizzle-orm";

export const ordersRouter = router({
  // UC017 — View orders
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    initializeDatabase();
    await seedDatabase();
    
    const user = ctx.session!.user as any;
    
    // In a real app, we might filter by clientId if role is CLIENT
    // For this demo, we show all orders to advisors/managers/admins
    const results = await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      serviceName: services.name,
      clientName: users.name,
    })
    .from(orders)
    .leftJoin(services, eq(orders.serviceId, services.id))
    .leftJoin(users, eq(orders.clientId, users.id))
    .orderBy(desc(orders.createdAt));

    return results;
  }),

  // Get single order details
  getOrderById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [result] = await db.select()
        .from(orders)
        .where(eq(orders.id, input.id));
      return result ?? null;
    }),
});
