"use client";

import type { Session } from "next-auth";
import { useMemo } from "react";
import Link from "next/link";

interface Props {
  stats: any;
  slaData: any;
  securityAudit: any;
  advisorWorkload: any;
  session: Session | null;
}

// ── Hero Metric ──────────────────────────────────────────
function HeroMetric({ label, value, trend, color, icon }: { label: string; value: string | number; trend?: string; color: string; icon: string }) {
  return (
    <div className="glass-panel p-8 flex flex-col justify-between min-h-[200px]">
      <div className="flex justify-between items-start">
        <div className="text-4xl">{icon}</div>
        {trend && (
          <div className="text-xs font-bold px-2 py-1 rounded-full" 
               style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-5xl font-black tracking-tighter mb-1" style={{ color: "white" }}>
          {value}
        </div>
        <div className="text-sm font-medium text-white/40 uppercase tracking-[0.2em]">
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Minimal Chart ────────────────────────────────────────
function MiniSLAChart({ compliance }: { compliance: number }) {
  return (
    <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
      <div className="relative w-40 h-40 mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="45" fill="none" 
            stroke="url(#neonGradient)" 
            strokeWidth="8" 
            strokeDasharray="283" 
            strokeDashoffset={283 - (compliance / 100) * 283}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2ff" />
              <stop offset="100%" stopColor="#bc13fe" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white">{compliance}%</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-1">עמידה ב-SLA</h3>
      <p className="text-sm text-white/40">ציון איכות השירות השנתי</p>
    </div>
  );
}

// ── Security Health ──────────────────────────────────────
function SecurityHealth({ score }: { score: number }) {
  const color = score >= 80 ? "#00ff9d" : score >= 60 ? "#f59e0b" : "#ff0055";
  return (
    <div className="glass-panel p-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">מצב אבטחה נוכחי</span>
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Security Score</h3>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-6xl font-black" style={{ color: color, textShadow: `0 0 20px ${color}40` }}>
          {score}
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30 mb-1 font-mono uppercase">Last Audit</div>
          <div className="text-sm text-white font-medium">היום, 10:30</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ stats, slaData, securityAudit, session }: Props) {
  const user = session?.user as any;
  const s = stats ?? { totalRevenue: 27200, totalOrders: 12, slaCompliance: 94 };

  return (
    <div className="max-w-[1200px] mx-auto py-12 px-4 space-y-12">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-full">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">
            Enterprise Management System
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter break-words">
            שלום, {user?.name?.split(" ")[0]} <span className="text-neon-cyan animate-pulse">.</span>
          </h1>
          <p className="text-white/40 mt-2 text-base md:text-lg font-light">סקירה כללית של ביצועי הסייבר והאבטחה בארגון</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/payments" className="btn-premium flex-1 md:flex-none justify-center">
            <span>💳</span>
            <span>ביצוע תשלום</span>
          </Link>
          <Link href="/dashboard/reports" className="btn-premium flex-1 md:flex-none justify-center">
            <span>📊</span>
            <span>הפק דוח</span>
          </Link>
        </div>
      </header>

      {/* ── BENTO GRID ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Main Stats Row */}
        <HeroMetric 
          label="הכנסות שנתיות" 
          value={`₪${(s.totalRevenue / 1000).toFixed(1)}k`} 
          trend="+12%" 
          color="#00ff9d" 
          icon="📈" 
        />
        <HeroMetric 
          label="הזמנות פעילות" 
          value={s.totalOrders} 
          trend="יציב" 
          color="#00f2ff" 
          icon="📦" 
        />
        <HeroMetric 
          label="זמן תגובה ממוצע" 
          value="1.2h" 
          trend="-0.4h" 
          color="#bc13fe" 
          icon="⚡" 
        />

        {/* Large Visual Row */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <MiniSLAChart compliance={s.slaCompliance} />
          <SecurityHealth score={securityAudit?.score ?? 88} />
        </div>

        {/* Info Card */}
        <div className="glass-panel p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-cyan/10 blur-[60px]" />
          <div>
            <h3 className="text-xl font-bold text-white mb-4">סיכום ביקורת אבטחה</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              הסוכן האוטומטי סרק 140 נקודות קצה. זוהה ממצא אחד בדרגת חומרה בינונית הדורש התייחסות.
            </p>
          </div>
          <Link href="/dashboard/audit" className="text-neon-cyan text-sm font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
            לכל הממצאים <span>←</span>
          </Link>
        </div>

      </div>

      {/* Quick Access Row */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "ניהול משתמשים", icon: "👤", href: "#" },
          { label: "יומן יועץ", icon: "📅", href: "#" },
          { label: "דוחות סיכונים", icon: "⚠️", href: "/dashboard/reports" },
          { label: "הגדרות מערכת", icon: "⚙️", href: "#" },
        ].map(item => (
          <Link key={item.label} href={item.href} className="glass-panel p-4 flex items-center gap-4 hover:scale-105">
            <span className="text-2xl">{item.icon}</span>
            <div className="text-right">
              <div className="text-xs font-bold text-white/80">{item.label}</div>
            </div>
          </Link>
        ))}
      </footer>

    </div>
  );
}
