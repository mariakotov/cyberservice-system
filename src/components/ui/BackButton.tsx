"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all text-xs font-bold mb-6 group"
    >
      <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>חזור</span>
    </button>
  );
}
