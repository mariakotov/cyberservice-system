"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BookOpen, 
  CreditCard, 
  BarChart3, 
  LogOut 
} from "lucide-react";

interface Props {
  session: Session;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/services", label: "Catalog", icon: BookOpen },
  { href: "/dashboard/payments", label: "Finance", icon: CreditCard },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

export default function DashboardSidebar({ session }: Props) {
  const pathname = usePathname();
  const user = session.user as any;

  return (
    <aside
      className="h-full w-[280px] bg-black/40 backdrop-blur-3xl border-l border-white/5 flex flex-col"
    >
      {/* Brand */}
      <div className="p-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center neon-glow-cyan">
            <span className="text-white font-black text-xl">C</span>
          </div>
          <div>
            <div className="text-lg font-black text-white tracking-tighter">CyberService</div>
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">ESM v1.2</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                active ? "bg-white/5 text-white border border-white/10" : "text-white/40 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-neon-cyan" : ""}`} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {active && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-neon-cyan neon-glow-cyan" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-8">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-white/30 font-bold uppercase">{user?.role}</div>
          </div>
          <button 
            onClick={() => signOut()}
            className="text-white/20 hover:text-neon-red transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
