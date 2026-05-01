/**
 * tRPC v11 Root Router — CyberService ESM
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Session } from "next-auth";

export type TRPCContext = {
  session: Session | null;
};

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure — requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "נדרשת התחברות למערכת" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

// Role-guard factory
export function roleGuard(...roles: string[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    const userRole = (ctx.session?.user as any)?.role;
    if (!roles.includes(userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `נדרשת הרשאה: ${roles.join(" / ")}`,
      });
    }
    return next({ ctx });
  });
}

export const createCallerFactory = t.createCallerFactory;
