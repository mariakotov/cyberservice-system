"use client";

import BackButton from "@/components/ui/BackButton";

const DEMO_REPORTS = [
  { id: "1", title: "דוח סיכונים רבעוני - Q1 2026", date: "2026-04-15", author: "יועץ סייבר א׳", status: "PUBLISHED" },
  { id: "2", title: "סקר נכסים דיגיטליים", date: "2026-03-22", author: "יועץ סייבר ב׳", status: "PUBLISHED" },
  { id: "3", title: "סיכום בדיקת חדירה - סניף תל אביב", date: "2026-05-01", author: "צוות אדום", status: "DRAFT" },
];

export default function ReportsPage() {
  return (
    <div className="animate-fade-in-up">
      <BackButton />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">דוחות סיכונים</h1>
          <p className="text-white/40">ניהול, עריכה ופרסום דוחות אבטחת מידע לארגון</p>
        </div>
        <button className="btn-premium">
          <span>+</span>
          <span>דוח חדש</span>
        </button>
      </div>

      <div className="grid gap-6">
        {DEMO_REPORTS.map((report) => (
          <div key={report.id} className="glass-panel p-6 flex items-center justify-between group hover:scale-[1.01]">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                {report.status === "PUBLISHED" ? "📄" : "📝"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">{report.title}</h3>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs text-white/30">פורסם ב-{report.date}</span>
                  <span className="text-xs text-white/30">ע״י {report.author}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                report.status === "PUBLISHED" ? "bg-neon-green/10 text-neon-green border-neon-green/20" : "bg-white/10 text-white/40 border-white/10"
              }`} style={{ border: "1px solid" }}>
                {report.status}
              </span>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors">
                👁
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
