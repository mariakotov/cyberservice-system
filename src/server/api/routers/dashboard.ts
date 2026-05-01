/**
 * Dashboard tRPC Router — UC046 (Admin Dashboard)
 * Aggregates data for the Bento Grid dashboard
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db, initializeDatabase, seedDatabase } from "@/infrastructure/db/client";
import { orders, users, tasks, paymentTransactions, supportTickets, riskReports } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";

export const dashboardRouter = router({
  // Main dashboard stats — Bento Grid data
  getStats: protectedProcedure.query(async () => {
    initializeDatabase();
    await seedDatabase();

    const allOrders = await db.select().from(orders);
    const allUsers = await db.select().from(users);
    const allTxs = await db.select().from(paymentTransactions);
    const allTasks = await db.select().from(tasks);
    const allTickets = await db.select().from(supportTickets);
    const allReports = await db.select().from(riskReports);

    const revenue = allTxs
      .filter(t => t.status === "APPROVED")
      .reduce((s, t) => s + t.amount, 0);

    // SLA compliance simulation
    const slaCompliant = Math.floor(allOrders.length * 0.87);
    const slaBreached = allOrders.length - slaCompliant;

    return {
      // Orders
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === "PENDING").length,
      inProgressOrders: allOrders.filter(o => o.status === "IN_PROGRESS").length,
      completedOrders: allOrders.filter(o => o.status === "COMPLETED").length,
      waitingPaymentOrders: allOrders.filter(o => o.status === "WAITING_PAYMENT").length,

      // Revenue
      totalRevenue: revenue,
      monthlyRevenue: revenue * 0.3, // Simulated

      // Users
      totalClients: allUsers.filter(u => u.role === "CLIENT").length,
      totalAdvisors: allUsers.filter(u => u.role === "CYBER_ADVISOR").length,
      activeUsers: allUsers.filter(u => u.isActive).length,

      // SLA
      slaCompliance: allOrders.length > 0
        ? Math.round((slaCompliant / allOrders.length) * 100)
        : 100,
      slaBreached,

      // Support
      openTickets: allTickets.filter(t => t.status === "OPEN").length,
      criticalTickets: allTickets.filter(t => t.priority === "CRITICAL").length,

      // Reports
      publishedReports: allReports.filter(r => r.status === "PUBLISHED").length,
      pendingApproval: allReports.filter(r => r.status === "PENDING_APPROVAL").length,

      // Tasks
      overdueTasks: allTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date() && !t.completedAt;
      }).length,
    };
  }),

  // Real-time SLA tracker data
  getSLAData: protectedProcedure.query(async () => {
    initializeDatabase();
    await seedDatabase();

    const allOrders = await db.select().from(orders);

    // Generate SLA time-series for the last 7 days
    const slaTimeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString("he-IL", { weekday: "short", month: "short", day: "numeric" }),
        compliance: Math.floor(80 + Math.random() * 20),
        breaches: Math.floor(Math.random() * 3),
      };
    });

    return {
      timeline: slaTimeline,
      currentCompliance: 87,
      criticalResponseAvg: 3.2, // hours
      highResponseAvg: 6.8,
      mediumResponseAvg: 18.5,
    };
  }),

  // Security audit status
  getSecurityAuditStatus: protectedProcedure.query(async () => {
    return {
      lastAuditDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      nextAuditDate: new Date(Date.now() + 23 * 86400000).toISOString(),
      score: 82,
      findings: [
        { id: "SEC-001", severity: "HIGH", title: "גרסת TLS מיושנת על שרת API", status: "OPEN" },
        { id: "SEC-002", severity: "MEDIUM", title: "הרשאות מנהל לא מוגבלות", status: "IN_REMEDIATION" },
        { id: "SEC-003", severity: "LOW", title: "לוגים ללא רוטציה", status: "RESOLVED" },
        { id: "SEC-004", severity: "CRITICAL", title: "ממשק פנימי חשוף לאינטרנט", status: "OPEN" },
      ],
      complianceChecks: {
        pciDss: true,
        iso27001: true,
        gdpr: false,
        nist: true,
      },
    };
  }),

  // Advisor workload for UC045
  getAdvisorWorkload: protectedProcedure.query(async () => {
    initializeDatabase();
    await seedDatabase();

    const advisors = await db.select().from(users).where(eq(users.role, "CYBER_ADVISOR"));

    return advisors.map(advisor => ({
      id: advisor.id,
      name: advisor.name,
      activeOrders: Math.floor(Math.random() * 5) + 1,
      completedThisMonth: Math.floor(Math.random() * 10) + 3,
      slaScore: Math.floor(75 + Math.random() * 25),
      hoursLogged: Math.floor(100 + Math.random() * 80),
    }));
  }),
});
