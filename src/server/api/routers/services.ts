/**
 * Services tRPC Router — UC011–UC016
 */

import { router, protectedProcedure } from "../trpc";
import { db, initializeDatabase, seedDatabase } from "@/infrastructure/db/client";
import { services } from "@/infrastructure/db/schema";
import { desc } from "drizzle-orm";

export const servicesRouter = router({
  // UC011 — View service catalog
  getCatalog: protectedProcedure.query(async () => {
    initializeDatabase();
    await seedDatabase();
    
    return db.select()
      .from(services)
      .orderBy(desc(services.createdAt));
  }),
});
