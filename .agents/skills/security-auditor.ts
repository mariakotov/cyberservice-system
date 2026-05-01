/**
 * Security Auditor Agent Skill
 * .agents/skills/security-auditor.ts
 *
 * Automated security audit agent for CyberService ESM.
 * Evaluates system configuration against security standards.
 * Referenced by UC036 (Critical Finding Alert) and the Dashboard.
 */

export interface SecurityCheck {
  id: string;
  name: string;
  category: "AUTHENTICATION" | "ENCRYPTION" | "ACCESS_CONTROL" | "AUDIT_LOG" | "COMPLIANCE" | "NETWORK";
  standard: "PCI-DSS" | "ISO27001" | "NIST" | "GDPR" | "INTERNAL";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  description: string;
}

export interface AuditFinding {
  check: SecurityCheck;
  passed: boolean;
  evidence: string;
  recommendation?: string;
  cvss?: number; // 0-10
}

export interface AuditReport {
  reportId: string;
  timestamp: Date;
  score: number; // 0-100
  passed: number;
  failed: number;
  findings: AuditFinding[];
  criticalFindings: AuditFinding[];
  complianceSummary: Record<string, { passed: number; total: number }>;
  overallStatus: "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT";
}

// Security check library
const SECURITY_CHECKS: SecurityCheck[] = [
  // Authentication
  { id: "AUTH-001", name: "MFA Enforcement", category: "AUTHENTICATION", standard: "ISO27001", severity: "HIGH",
    description: "Multi-factor authentication must be enforced for all admin accounts" },
  { id: "AUTH-002", name: "Session Timeout", category: "AUTHENTICATION", standard: "NIST", severity: "MEDIUM",
    description: "User sessions must timeout after 30 minutes of inactivity" },
  { id: "AUTH-003", name: "Password Complexity", category: "AUTHENTICATION", standard: "NIST", severity: "MEDIUM",
    description: "Passwords must meet minimum complexity requirements" },

  // Encryption
  { id: "ENC-001", name: "TLS 1.3 Enforcement", category: "ENCRYPTION", standard: "PCI-DSS", severity: "CRITICAL",
    description: "All data in transit must use TLS 1.3 or higher" },
  { id: "ENC-002", name: "PCI-DSS Card Data", category: "ENCRYPTION", standard: "PCI-DSS", severity: "CRITICAL",
    description: "Card numbers must never be stored in plaintext (only last 4 digits allowed)" },
  { id: "ENC-003", name: "Database Encryption at Rest", category: "ENCRYPTION", standard: "ISO27001", severity: "HIGH",
    description: "Sensitive data in the database must be encrypted at rest" },

  // Access Control
  { id: "AC-001", name: "Least Privilege Principle", category: "ACCESS_CONTROL", standard: "ISO27001", severity: "HIGH",
    description: "Users must only have access to resources needed for their role" },
  { id: "AC-002", name: "Admin Interface Protection", category: "ACCESS_CONTROL", standard: "NIST", severity: "CRITICAL",
    description: "Admin interfaces must not be exposed to public internet" },
  { id: "AC-003", name: "RBAC Implementation", category: "ACCESS_CONTROL", standard: "INTERNAL", severity: "HIGH",
    description: "Role-based access control must be implemented for all 6 user roles" },

  // Audit Log
  { id: "AUDIT-001", name: "Payment Audit Trail", category: "AUDIT_LOG", standard: "PCI-DSS", severity: "CRITICAL",
    description: "All payment attempts must be logged in immutable audit log (UC037 BR2)" },
  { id: "AUDIT-002", name: "Login Attempts Logging", category: "AUDIT_LOG", standard: "ISO27001", severity: "HIGH",
    description: "All authentication attempts (success/failure) must be logged" },
  { id: "AUDIT-003", name: "Log Retention Policy", category: "AUDIT_LOG", standard: "GDPR", severity: "MEDIUM",
    description: "Audit logs must be retained for minimum 12 months" },

  // Compliance
  { id: "COMP-001", name: "GDPR Data Processing", category: "COMPLIANCE", standard: "GDPR", severity: "HIGH",
    description: "Personal data processing must comply with GDPR Article 6" },
  { id: "COMP-002", name: "PCI-DSS SAQ", category: "COMPLIANCE", standard: "PCI-DSS", severity: "HIGH",
    description: "Annual PCI-DSS self-assessment questionnaire must be completed" },

  // Network
  { id: "NET-001", name: "API Rate Limiting", category: "NETWORK", standard: "INTERNAL", severity: "MEDIUM",
    description: "Payment API endpoints must have rate limiting to prevent abuse" },
  { id: "NET-002", name: "Input Sanitization", category: "NETWORK", standard: "NIST", severity: "HIGH",
    description: "All user inputs must be sanitized to prevent injection attacks" },
];

export class SecurityAuditorSkill {
  /**
   * Run automated security audit
   * In production: this would probe actual system config
   * In demo: simulates realistic findings
   */
  runAudit(context?: { environment?: string }): AuditReport {
    const reportId = `AUDIT-${Date.now()}`;
    const findings: AuditFinding[] = [];

    // Simulate audit results
    const DEMO_RESULTS: Record<string, { passed: boolean; evidence: string; cvss?: number }> = {
      "AUTH-001": { passed: true, evidence: "MFA enforced via NextAuth with TOTP second factor" },
      "AUTH-002": { passed: true, evidence: "JWT session expires after 30min, enforced in NextAuth config" },
      "AUTH-003": { passed: true, evidence: "Password policy: min 8 chars, uppercase, number, special char" },
      "ENC-001":  { passed: true, evidence: "TLS 1.3 configured in Next.js deployment. Verified via SSL Labs." },
      "ENC-002":  { passed: true, evidence: "Only last 4 card digits stored. cardToken used for gateway. PCI-DSS ✓" },
      "ENC-003":  { passed: false, evidence: "Database running without encryption at rest in development mode", cvss: 6.5 },
      "AC-001":   { passed: true, evidence: "RBAC implemented: 6 roles with granular tRPC procedure guards" },
      "AC-002":   { passed: false, evidence: "Admin interface accessible from public URL without IP restriction", cvss: 8.1 },
      "AC-003":   { passed: true, evidence: "roleGuard() applied to all sensitive tRPC procedures" },
      "AUDIT-001":{ passed: true, evidence: "All payment attempts logged with actor, IP, timestamp, result" },
      "AUDIT-002":{ passed: true, evidence: "NextAuth logs all auth events to audit table" },
      "AUDIT-003":{ passed: false, evidence: "Log retention policy not configured. Logs purged after 30 days.", cvss: 4.3 },
      "COMP-001": { passed: false, evidence: "GDPR DPA not signed with data processors", cvss: 5.0 },
      "COMP-002": { passed: true, evidence: "PCI-DSS SAQ-A completed March 2026" },
      "NET-001":  { passed: true, evidence: "Rate limiting: 100 requests/min per IP on payment endpoints" },
      "NET-002":  { passed: true, evidence: "Zod schema validation on all tRPC inputs. No SQL injections possible." },
    };

    for (const check of SECURITY_CHECKS) {
      const demo = DEMO_RESULTS[check.id];
      findings.push({
        check,
        passed: demo?.passed ?? true,
        evidence: demo?.evidence ?? "Automated check passed",
        recommendation: demo?.passed ? undefined : this.getRecommendation(check.id),
        cvss: demo?.cvss,
      });
    }

    const passed = findings.filter((f) => f.passed).length;
    const failed = findings.filter((f) => !f.passed).length;
    const criticalFindings = findings.filter((f) => !f.passed && f.check.severity === "CRITICAL");

    // Score: weighted by severity
    const severityWeights = { CRITICAL: 10, HIGH: 5, MEDIUM: 2, LOW: 1, INFORMATIONAL: 0.5 };
    const maxScore = SECURITY_CHECKS.reduce((s, c) => s + severityWeights[c.severity], 0);
    const lostScore = findings
      .filter((f) => !f.passed)
      .reduce((s, f) => s + severityWeights[f.check.severity], 0);
    const score = Math.max(0, Math.round(((maxScore - lostScore) / maxScore) * 100));

    // Compliance by standard
    const standards = [...new Set(SECURITY_CHECKS.map((c) => c.standard))];
    const complianceSummary: Record<string, { passed: number; total: number }> = {};
    for (const std of standards) {
      const stdFindings = findings.filter((f) => f.check.standard === std);
      complianceSummary[std] = {
        passed: stdFindings.filter((f) => f.passed).length,
        total: stdFindings.length,
      };
    }

    let overallStatus: AuditReport["overallStatus"] = "COMPLIANT";
    if (criticalFindings.length > 0) overallStatus = "NON_COMPLIANT";
    else if (failed > 2) overallStatus = "AT_RISK";

    return {
      reportId,
      timestamp: new Date(),
      score,
      passed,
      failed,
      findings,
      criticalFindings,
      complianceSummary,
      overallStatus,
    };
  }

  private getRecommendation(checkId: string): string {
    const recs: Record<string, string> = {
      "ENC-003": "Enable SQLite encryption using SQLCipher, or migrate to PostgreSQL with transparent data encryption",
      "AC-002":  "Restrict admin interface to VPN/IP whitelist using middleware or cloud WAF rules",
      "AUDIT-003": "Configure log rotation policy to retain logs for 12+ months in cold storage (S3 Glacier)",
      "COMP-001": "Sign DPA agreements with all data processors. Consult legal counsel for GDPR Article 28 compliance",
    };
    return recs[checkId] ?? "Review and remediate according to security policy";
  }

  /**
   * Generate a UC036 critical finding alert for any CRITICAL failures
   */
  generateCriticalAlerts(report: AuditReport): string[] {
    return report.criticalFindings.map(
      (f) =>
        `🚨 CRITICAL SECURITY FINDING [${f.check.id}]: ${f.check.name} — ${f.evidence}. CVSS: ${f.cvss ?? "N/A"}/10`
    );
  }
}

export const securityAuditor = new SecurityAuditorSkill();
