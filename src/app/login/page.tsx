"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  { email: "client@demo.com", label: "Client", icon: "👤", color: "#00f2ff" },
  { email: "advisor@demo.com", label: "Advisor", icon: "🔒", color: "#bc13fe" },
  { email: "admin@demo.com", label: "Admin", icon: "⚙️", color: "#ff0055" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (email: string) => {
    setLoading(true);
    await signIn("credentials", {
      email,
      password: "demo123",
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-midnight relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 blur-[120px] rounded-full animate-pulse-soft" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full animate-pulse-soft" />

      <div className="glass-panel w-full max-w-[440px] p-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center mb-6 neon-glow-cyan animate-float">
            <span className="text-white font-black text-3xl">C</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">CyberService</h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">Enterprise Service Management</p>
        </div>

        <div className="space-y-6">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest text-center">Quick Access Portals</p>
          <div className="grid grid-cols-1 gap-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleDemoLogin(acc.email)}
                disabled={loading}
                className="glass-panel p-4 flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{acc.icon}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">{acc.label} Portal</div>
                    <div className="text-[10px] text-white/30 font-mono">{acc.email}</div>
                  </div>
                </div>
                <div className="text-white/20 group-hover:text-white transition-colors">→</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            Secured by Quantum-Ready Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
