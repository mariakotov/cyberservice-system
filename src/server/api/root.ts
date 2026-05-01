/**
 * tRPC Root App Router — CyberService ESM
 */

import { router } from "./trpc";
import { paymentsRouter } from "./routers/payments";
import { dashboardRouter } from "./routers/dashboard";
import { ordersRouter } from "./routers/orders";
import { servicesRouter } from "./routers/services";

export const appRouter = router({
  payments: paymentsRouter,
  dashboard: dashboardRouter,
  orders: ordersRouter,
  services: servicesRouter,
});

export type AppRouter = typeof appRouter;
