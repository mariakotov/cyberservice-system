"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

// Demo data for visual excellence
const DEMO_ORDERS = [
  { id: "1", orderNumber: "ORD-2026-0001", clientName: "דני כהן", serviceName: "בדיקת חדירה - רשת פנימית", status: "WAITING_PAYMENT", amount: 5600, date: "2026-05-01" },
  { id: "2", orderNumber: "ORD-2026-0002", clientName: "חברת אבטחה בע״מ", serviceName: "ביקורת אבטחה מקיפה", status: "IN_PROGRESS", amount: 9600, date: "2026-04-30" },
  { id: "3", orderNumber: "ORD-2026-0003", clientName: "הייטק סטארטאפ", serviceName: "הכשרת עובדים", status: "COMPLETED", amount: 4000, date: "2026-04-28" },
  { id: "4", orderNumber: "ORD-2026-0004", clientName: "בנק ירושלים", serviceName: "תגובה לאירועי סייבר", status: "PAID", amount: 8000, date: "2026-04-25" },
];

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  WAITING_PAYMENT: { label: "ממתין לתשלום", class: "status-waiting" },
  IN_PROGRESS: { label: "בתהליך", class: "status-progress" },
  COMPLETED: { label: "הושלם", class: "status-paid" },
  PAID: { label: "שולם", class: "status-paid" },
  PENDING: { label: "ממתין", class: "status-pending" },
};

export default function OrdersPage() {
  const [filter, setFilter] = useState("ALL");

  const filteredOrders = filter === "ALL" 
    ? DEMO_ORDERS 
    : DEMO_ORDERS.filter(o => o.status === filter);

  return (
    <div className="animate-fade-in-up">
      <BackButton />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">ניהול הזמנות</h1>
          <p className="text-white/50">מעקב אחר סטטוס שירותים והזמנות פעילות</p>
        </div>
        <Link href="/dashboard/services" className="btn-primary">
          + הזמנת שירות חדש
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["ALL", "WAITING_PAYMENT", "IN_PROGRESS", "COMPLETED", "PAID"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === s 
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" 
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            }`}
            style={{ border: "1px solid transparent" }}
          >
            {s === "ALL" ? "הכל" : STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">מספר הזמנה</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">לקוח</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">שירות</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">סטטוס</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">סכום</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">תאריך</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-cyan-400 font-bold">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                  {order.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                  {order.serviceName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge ${STATUS_MAP[order.status]?.class}`}>
                    {STATUS_MAP[order.status]?.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                  ₪{order.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {order.status === "WAITING_PAYMENT" && (
                      <Link href="/dashboard/payments" className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20" title="שלם עכשיו">
                        💳
                      </Link>
                    )}
                    <button className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 border border-white/10" title="פרטים">
                      👁
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
