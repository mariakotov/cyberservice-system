"use client";

import BackButton from "@/components/ui/BackButton";

const AUDIT_CHECKS = [
  { id: "1", name: "אימות דו-שלבי (MFA)", category: "AUTHENTICATION", status: "PASSED", severity: "HIGH" },
  { id: "2", name: "הצפנת מסד נתונים", category: "ENCRYPTION", status: "WARNING", severity: "CRITICAL" },
  { id: "3", name: "ניהול הרשאות (RBAC)", category: "ACCESS_CONTROL", status: "PASSED", severity: "HIGH" },
  { id: "4", name: "לוגים של פעולות תשלום", category: "AUDIT_LOG", status: "PASSED", severity: "CRITICAL" },
];

export default function AuditPage() {
  return (
    <div className="animate-fade-in-up">
      <BackButton />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">ביקורת אבטחה</h1>
          <p className="text-white/40">סקירה אוטומטית של עמידה בתקני אבטחה ורגולציה</p>
        </div>
      </div>

      <div className="grid gap-4">
        {AUDIT_CHECKS.map((check) => (
          <div key={check.id} className="glass-panel p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-3 h-3 rounded-full ${check.status === "PASSED" ? "bg-neon-green neon-glow-cyan" : "bg-neon-red shadow-[0_0_10px_rgba(255,0,85,0.5)]"}`} />
              <div>
                <h3 className="text-lg font-bold text-white">{check.name}</h3>
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">{check.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                check.severity === "CRITICAL" ? "bg-neon-red/10 text-neon-red" : "bg-neon-cyan/10 text-neon-cyan"
              }`} style={{ border: "1px solid currentColor" }}>
                {check.severity}
              </span>
              <span className="text-sm font-bold text-white/60">{check.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
