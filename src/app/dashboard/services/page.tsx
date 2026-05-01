"use client";

import { useState } from "react";
import BackButton from "@/components/ui/BackButton";

const DEMO_SERVICES = [
  { id: "1", name: "בדיקת חדירה - רשת פנימית", category: "PENETRATION_TEST", price: 350, hours: 16, sla: "HIGH", description: "בדיקת אבטחה מקיפה לרשת הפנימית של הארגון, זיהוי נקודות תורפה ומתן המלצות לתיקון." },
  { id: "2", name: "ביקורת אבטחה מקיפה", category: "SECURITY_AUDIT", price: 400, hours: 24, sla: "CRITICAL", description: "סקירה מעמיקה של מדיניות האבטחה, בקרות הגישה ותהליכי העבודה בארגון." },
  { id: "3", name: "תגובה לאירועי סייבר", category: "INCIDENT_RESPONSE", price: 500, hours: 8, sla: "CRITICAL", description: "מענה מיידי לאירועי סייבר בזמן אמת, בלימת התקפות ושחזור פעילות עסקית." },
  { id: "4", name: "הכשרת עובדים - מודעות סייבר", category: "TRAINING", price: 200, hours: 4, sla: "LOW", description: "סדנאות והדרכות לעובדים בנושאי פישינג, הנדסה חברתית ושמירה על היגיינת סייבר." },
  { id: "5", name: "עמידה בתקנות GDPR/ISO27001", category: "COMPLIANCE", price: 450, hours: 20, sla: "MEDIUM", description: "ליווי תהליכי הסמכה לתקנים בינלאומיים ועמידה ברגולציה להגנת הפרטיות." },
  { id: "6", name: "ניטור רציף 24/7", category: "MONITORING", price: 300, hours: 160, sla: "CRITICAL", description: "מרכז בקרה (SOC) המנטר את המערכות מסביב לשעון ומתריע על כל פעילות חשודה." },
];

const CATEGORY_MAP: Record<string, string> = {
  PENETRATION_TEST: "בדיקות חדירה",
  SECURITY_AUDIT: "ביקורת אבטחה",
  INCIDENT_RESPONSE: "תגובה לאירועים",
  TRAINING: "הדרכה",
  COMPLIANCE: "רגולציה",
  MONITORING: "ניטור",
};

const SLA_COLOR: Record<string, string> = {
  CRITICAL: "#ff3d71",
  HIGH: "#f59e0b",
  MEDIUM: "#00c8ff",
  LOW: "#00ffa3",
};

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredServices = selectedCategory === "ALL" 
    ? DEMO_SERVICES 
    : DEMO_SERVICES.filter(s => s.category === selectedCategory);

  return (
    <div className="animate-fade-in-up">
      <BackButton />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">קטלוג שירותים</h1>
          <p className="text-white/50">מגוון שירותי סייבר מקצועיים בהתאמה אישית</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === "ALL" 
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" 
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
          }`}
          style={{ border: "1px solid transparent" }}
        >
          הכל
        </button>
        {Object.entries(CATEGORY_MAP).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === key 
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" 
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            }`}
            style={{ border: "1px solid transparent" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {filteredServices.map((service) => (
          <div key={service.id} className="glass-card p-6 flex flex-col group">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-white/40 border border-white/10">
                {CATEGORY_MAP[service.category]}
              </div>
              <div className="text-xs font-bold px-2 py-1 rounded flex items-center gap-1"
                style={{ background: `${SLA_COLOR[service.sla]}15`, color: SLA_COLOR[service.sla], border: `1px solid ${SLA_COLOR[service.sla]}30` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: SLA_COLOR[service.sla] }} />
                SLA: {service.sla}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6 flex-1">
              {service.description}
            </p>

            <div className="flex items-end justify-between mt-auto pt-6 border-t border-white/5">
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider">מחיר לשעה</div>
                <div className="text-2xl font-black text-white">₪{service.price}</div>
              </div>
              <div className="text-left">
                <div className="text-xs text-white/30 uppercase tracking-wider">הערכת זמן</div>
                <div className="text-lg font-bold text-white/80">{service.hours} שעות</div>
              </div>
            </div>

            <button className="btn-primary w-full mt-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
              הזמן שירות עכשיו
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
