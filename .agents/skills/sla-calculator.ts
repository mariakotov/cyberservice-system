/**
 * SLA Calculator Agent Skill
 * .agents/skills/sla-calculator.ts
 *
 * Computes SLA compliance in real-time for CyberService orders.
 * Used by the dashboard for SLA tracking and breach detection.
 */

import { SLA_LEVEL, SLA_RESPONSE_HOURS, type SLALevel } from "@/core/value-objects";

export interface SLAInput {
  orderId: string;
  slaLevel: SLALevel;
  createdAt: Date;
  firstResponseAt?: Date;
  status: string;
}

export interface SLAResult {
  orderId: string;
  slaLevel: SLALevel;
  maxResponseHours: number;
  elapsedHours: number;
  remainingHours: number;
  compliancePercent: number;
  isBreached: boolean;
  isCritical: boolean;  // < 20% time remaining
  breachAt: Date;
  status: "ON_TRACK" | "AT_RISK" | "BREACHED";
}

export class SLACalculatorSkill {
  /**
   * Calculate SLA status for a single order
   */
  calculate(input: SLAInput): SLAResult {
    const maxHours = SLA_RESPONSE_HOURS[input.slaLevel];
    const now = new Date();
    const elapsed = (now.getTime() - input.createdAt.getTime()) / 3_600_000;
    const remaining = maxHours - elapsed;
    const compliancePercent = Math.max(0, Math.min(100, (remaining / maxHours) * 100));

    const isBreached = elapsed > maxHours;
    const isCritical = !isBreached && compliancePercent < 20;
    const breachAt = new Date(input.createdAt.getTime() + maxHours * 3_600_000);

    let status: SLAResult["status"];
    if (isBreached) status = "BREACHED";
    else if (isCritical) status = "AT_RISK";
    else status = "ON_TRACK";

    return {
      orderId: input.orderId,
      slaLevel: input.slaLevel,
      maxResponseHours: maxHours,
      elapsedHours: Math.round(elapsed * 10) / 10,
      remainingHours: Math.round(Math.max(0, remaining) * 10) / 10,
      compliancePercent: Math.round(compliancePercent),
      isBreached,
      isCritical,
      breachAt,
      status,
    };
  }

  /**
   * Calculate aggregate SLA compliance for a portfolio of orders
   */
  calculatePortfolio(inputs: SLAInput[]): {
    overallCompliance: number;
    breachedCount: number;
    atRiskCount: number;
    onTrackCount: number;
    byLevel: Record<SLALevel, { count: number; avgCompliance: number }>;
    results: SLAResult[];
  } {
    const results = inputs.map((i) => this.calculate(i));

    const breached = results.filter((r) => r.status === "BREACHED");
    const atRisk = results.filter((r) => r.status === "AT_RISK");
    const onTrack = results.filter((r) => r.status === "ON_TRACK");

    const overallCompliance =
      results.length > 0
        ? Math.round(
            results.reduce((s, r) => s + r.compliancePercent, 0) / results.length
          )
        : 100;

    const byLevel = {} as Record<SLALevel, { count: number; avgCompliance: number }>;
    for (const level of Object.values(SLA_LEVEL)) {
      const levelResults = results.filter((r) => r.slaLevel === level);
      byLevel[level] = {
        count: levelResults.length,
        avgCompliance:
          levelResults.length > 0
            ? Math.round(levelResults.reduce((s, r) => s + r.compliancePercent, 0) / levelResults.length)
            : 100,
      };
    }

    return {
      overallCompliance,
      breachedCount: breached.length,
      atRiskCount: atRisk.length,
      onTrackCount: onTrack.length,
      byLevel,
      results,
    };
  }

  /**
   * Generate a textual SLA report
   */
  generateReport(portfolio: ReturnType<typeof this.calculatePortfolio>): string {
    const lines: string[] = [
      `# SLA Portfolio Report`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `## Summary`,
      `- Overall Compliance: ${portfolio.overallCompliance}%`,
      `- Breached: ${portfolio.breachedCount}`,
      `- At Risk: ${portfolio.atRiskCount}`,
      `- On Track: ${portfolio.onTrackCount}`,
      ``,
      `## By SLA Level`,
    ];

    for (const [level, data] of Object.entries(portfolio.byLevel)) {
      lines.push(`- ${level}: ${data.count} orders, avg compliance ${data.avgCompliance}%`);
    }

    if (portfolio.breachedCount > 0) {
      lines.push(``, `## ⚠️ Breached Orders`);
      portfolio.results
        .filter((r) => r.status === "BREACHED")
        .forEach((r) => {
          lines.push(`- Order ${r.orderId}: SLA ${r.slaLevel}, elapsed ${r.elapsedHours}h (max ${r.maxResponseHours}h)`);
        });
    }

    return lines.join("\n");
  }
}

export const slaCalculator = new SLACalculatorSkill();
