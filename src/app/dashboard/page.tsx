import { auth } from "@/lib/auth";
import { createCallerFactory } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import DashboardClient from "./DashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "לוח בקרה — CyberService ESM",
};

const createCaller = createCallerFactory(appRouter);

export default async function DashboardPage() {
  const session = await auth();

  // RSC: Fetch data server-side
  const caller = createCaller({ session });
  const [stats, slaData, securityAudit, advisorWorkload] = await Promise.allSettled([
    caller.dashboard.getStats(),
    caller.dashboard.getSLAData(),
    caller.dashboard.getSecurityAuditStatus(),
    caller.dashboard.getAdvisorWorkload(),
  ]);

  return (
    <DashboardClient
      stats={stats.status === "fulfilled" ? stats.value : null}
      slaData={slaData.status === "fulfilled" ? slaData.value : null}
      securityAudit={securityAudit.status === "fulfilled" ? securityAudit.value : null}
      advisorWorkload={advisorWorkload.status === "fulfilled" ? advisorWorkload.value : null}
      session={session}
    />
  );
}
