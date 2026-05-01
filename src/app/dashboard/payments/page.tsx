/**
 * UC037 Payment Flow — Multi-Step Form
 * Step 1: Select order
 * Step 2: Enter payment details
 * Step 3: Confirm & submit
 * Step 4: Result (success/declined/timeout)
 */

"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/ui/BackButton";

// Types (simplified for client-side use without server imports)
type Step = 1 | 2 | 3 | 4;
type Scenario = "success" | "decline" | "timeout" | "random";
type PaymentMethod = "CREDIT_CARD" | "BANK_TRANSFER" | "CHECK";

interface DemoOrder {
  id: string;
  orderNumber: string;
  serviceId: string;
  status: string;
  totalAmount: number;
}

interface PaymentResult {
  type: "success" | "declined" | "timeout" | "error";
  invoiceNumber?: string;
  transactionId?: string;
  declineReason?: string;
  message?: string;
}

const STEP_LABELS = ["בחירת הזמנה", "פרטי תשלום", "אישור", "תוצאה"];

// ── Step indicator ─────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`payment-step-circle ${isDone ? "step-done" : isActive ? "step-active" : "step-inactive"}`}>
                {isDone ? "✓" : step}
              </div>
              <span className="text-xs whitespace-nowrap"
                style={{ color: isActive ? "#00c8ff" : isDone ? "#00ffa3" : "rgba(255,255,255,0.3)" }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="w-12 h-px mb-5"
                style={{ background: isDone ? "rgba(0,255,163,0.4)" : "rgba(255,255,255,0.1)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Credit Card Preview ────────────────────────────────────
function CreditCardPreview({ lastFour, brand, name }: { lastFour: string; brand: string; name: string }) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1f3a 0%, #0d1526 100%)",
        border: "1px solid rgba(0,200,255,0.2)",
        minWidth: "260px",
      }}
    >
      {/* Shimmer lines */}
      <div className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(0,200,255,0.2) 0%, transparent 60%)" }} />

      <div className="relative">
        <div className="flex justify-between items-start mb-8">
          <div className="text-xs font-mono text-white/40 uppercase">{brand || "VISA"}</div>
          <div className="flex gap-1">
            <div className="w-7 h-7 rounded-full opacity-80" style={{ background: "#eb001b" }} />
            <div className="w-7 h-7 rounded-full opacity-80 -mr-3" style={{ background: "#f79e1b" }} />
          </div>
        </div>
        <div className="font-mono text-lg tracking-widest text-white mb-4">
          •••• •••• •••• {lastFour || "0000"}
        </div>
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-white/30">שם בעל הכרטיס</div>
            <div className="text-sm text-white font-medium">{name || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-white/30">תוקף</div>
            <div className="text-sm font-mono text-white">12/28</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFlowWizard() {
  const [step, setStep] = useState<Step>(1);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DemoOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [cardLastFour, setCardLastFour] = useState("");
  const [cardBrand, setCardBrand] = useState("VISA");
  const [scenario, setScenario] = useState<Scenario>("random");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load demo orders (simulated)
  useEffect(() => {
    const demo: DemoOrder[] = [
      { id: "ord-001", orderNumber: "ORD-2026-0001", serviceId: "svc-1", status: "WAITING_PAYMENT", totalAmount: 5600 },
      { id: "ord-002", orderNumber: "ORD-2026-0004", serviceId: "svc-2", status: "WAITING_PAYMENT", totalAmount: 9600 },
    ];
    setOrders(demo);
  }, []);

  // ── Step 1: Order Selection ────────────────────────────
  const renderStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 className="text-xl font-bold text-white mb-2">בחר הזמנה לתשלום</h3>
      <p className="text-white/50 text-sm mb-6">הזמנות הממתינות לתשלום</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">✓</div>
          <div>אין הזמנות ממתינות לתשלום</div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => { setSelectedOrder(order); setStep(2); }}
              className="w-full glass-card p-4 text-right hover:border-cyan-500/40 transition-all duration-200 hover:scale-[1.01]"
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{order.orderNumber}</div>
                  <div className="text-sm text-white/50 mt-0.5">
                    <span className="status-badge status-waiting">{order.status === "WAITING_PAYMENT" ? "ממתין לתשלום" : order.status}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-gradient">
                    ₪{order.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/30 text-left">כולל מע״מ</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Step 2: Payment Details ────────────────────────────
  const renderStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 className="text-xl font-bold text-white mb-2">פרטי אמצעי תשלום</h3>
      <p className="text-white/50 text-sm mb-6">
        סה״כ לחיוב: <span className="text-white font-bold">₪{selectedOrder?.totalAmount.toLocaleString()}</span>
      </p>

      {/* Payment Method selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {(["CREDIT_CARD", "BANK_TRANSFER", "CHECK"] as PaymentMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => setPaymentMethod(m)}
            className="p-3 rounded-xl text-center transition-all duration-200"
            style={{
              background: paymentMethod === m ? "rgba(0,200,255,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${paymentMethod === m ? "rgba(0,200,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: paymentMethod === m ? "#00c8ff" : "rgba(255,255,255,0.5)",
            }}
          >
            <div className="text-xl mb-1">{m === "CREDIT_CARD" ? "💳" : m === "BANK_TRANSFER" ? "🏦" : "📝"}</div>
            <div className="text-xs font-medium">
              {m === "CREDIT_CARD" ? "כרטיס אשראי" : m === "BANK_TRANSFER" ? "העברה בנקאית" : "המחאה"}
            </div>
          </button>
        ))}
      </div>

      {paymentMethod === "CREDIT_CARD" && (
        <div className="flex gap-6 items-start">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">מספר כרטיס (4 ספרות אחרונות)</label>
              <input
                type="text"
                maxLength={4}
                value={cardLastFour}
                onChange={(e) => {
                  setCardLastFour(e.target.value.replace(/\D/g, ""));
                  if (fieldErrors.cardLastFour) setFieldErrors((prev) => ({ ...prev, cardLastFour: "" }));
                }}
                className={`input-glass ${fieldErrors.cardLastFour ? "error" : ""}`}
                placeholder="1234"
                dir="ltr"
              />
              {fieldErrors.cardLastFour && (
                <p className="text-xs mt-1" style={{ color: "#ff3d71" }}>{fieldErrors.cardLastFour}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">מותג כרטיס</label>
              <select
                value={cardBrand}
                onChange={(e) => setCardBrand(e.target.value)}
                className="input-glass"
              >
                <option value="VISA">Visa</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="AMEX">American Express</option>
                <option value="ISRACARD">Isracard</option>
              </select>
            </div>
          </div>
          <CreditCardPreview lastFour={cardLastFour} brand={cardBrand} name="דני כהן" />
        </div>
      )}

      {/* Scenario selector (demo only) */}
      <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-xs font-semibold text-purple-400 mb-3">🎭 מצב סימולציה (דמו בלבד)</p>
        <div className="flex gap-2 flex-wrap">
          {(["success", "decline", "timeout", "random"] as Scenario[]).map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: scenario === s ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.04)",
                color: scenario === s ? "#a78bfa" : "rgba(255,255,255,0.4)",
                border: `1px solid ${scenario === s ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {s === "success" ? "✓ אישור" : s === "decline" ? "✗ דחייה" : s === "timeout" ? "⏱ Timeout" : "🎲 אקראי"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => setStep(1)} className="btn-ghost flex-1">חזור</button>
        <button
          onClick={() => {
            const errors: Record<string, string> = {};
            if (paymentMethod === "CREDIT_CARD" && cardLastFour.length !== 4) {
              errors.cardLastFour = "נדרשות 4 ספרות אחרונות";
            }
            if (Object.keys(errors).length > 0) {
              setFieldErrors(errors);
              return;
            }
            setStep(3);
          }}
          className="btn-primary flex-1"
        >
          המשך לאישור →
        </button>
      </div>
    </div>
  );

  // ── Step 3: Confirm ────────────────────────────────────
  const renderStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 className="text-xl font-bold text-white mb-2">אישור תשלום</h3>
      <p className="text-white/50 text-sm mb-6">אנא אמת את פרטי העסקה לפני ביצועה</p>

      <div className="space-y-3 mb-6">
        {[
          { label: "הזמנה", value: selectedOrder?.orderNumber },
          { label: "סכום", value: `₪${selectedOrder?.totalAmount.toLocaleString()} + מע״מ 17% = ₪${((selectedOrder?.totalAmount ?? 0) * 1.17).toFixed(2)}` },
          { label: "אמצעי תשלום", value: paymentMethod === "CREDIT_CARD" ? `כרטיס אשראי **** ${cardLastFour}` : paymentMethod === "BANK_TRANSFER" ? "העברה בנקאית" : "המחאה" },
          { label: "עמידה בתקן", value: "PCI-DSS · TLS 1.3" },
          { label: "מצב סימולציה", value: scenario },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-white/50 text-sm">{row.label}</span>
            <span className="text-white font-medium text-sm">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl mb-6"
        style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.15)" }}>
        <p className="text-xs text-white/50">
          🔒 פרטי כרטיס האשראי אינם נשמרים במערכת. העסקה תבוצע דרך ממשק PCI-DSS מאובטח ומוצפן ב-TLS 1.3.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="btn-ghost flex-1" disabled={loading}>
          ביטול
        </button>
        <button
          onClick={handleSubmitPayment}
          className="btn-primary flex-1"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
              שולח לסליקה...
            </span>
          ) : "אשר ושלח לסליקה ←"}
        </button>
      </div>
    </div>
  );

  // ── Step 4: Result ─────────────────────────────────────
  const renderStep4 = () => {
    if (!result) return null;
    const isSuccess = result.type === "success";
    const isDeclined = result.type === "declined";
    const isTimeout = result.type === "timeout";

    return (
      <div className="animate-fade-in-up text-center">
        <div className="text-6xl mb-6">
          {isSuccess ? "✅" : isDeclined ? "❌" : isTimeout ? "⏱" : "⚠️"}
        </div>
        <h3 className="text-2xl font-black mb-3"
          style={{ color: isSuccess ? "#00ffa3" : isDeclined ? "#ff3d71" : "#f59e0b" }}>
          {isSuccess ? "התשלום בוצע בהצלחה!" : isDeclined ? "התשלום נדחה" : "תקלת תקשורת"}
        </h3>

        {isSuccess && (
          <div className="space-y-2 mb-6">
            <p className="text-white/50">
              חשבונית מספר <span className="font-mono font-bold text-white">{result.invoiceNumber}</span> נשלחה לאימייל
            </p>
            <p className="text-white/30 text-sm font-mono">{result.transactionId}</p>
          </div>
        )}

        {isDeclined && (
          <div className="mb-6">
            <p className="text-white/60 mb-4">{result.declineReason}</p>
            <p className="text-white/40 text-sm">ניתן לבחור אמצעי תשלום חלופי</p>
          </div>
        )}

        {isTimeout && (
          <div className="mb-6">
            <p className="text-white/60 mb-4">לא התקבלה תגובה מספק הסליקה תוך 5 שניות</p>
            <p className="text-white/40 text-sm">ההזמנה נותרה בסטטוס "ממתין לתשלום". אנא נסה שוב בעוד מספר דקות.</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setStep(1); setResult(null); setSelectedOrder(null); setCardLastFour(""); }}
            className={isSuccess ? "btn-ghost" : "btn-primary"}
          >
            {isSuccess ? "תשלום נוסף" : isDeclined ? "נסה שוב עם אמצעי אחר" : "נסה שוב"}
          </button>
          {isSuccess && (
            <a href="/dashboard" className="btn-primary">
              חזור ללוח הבקרה
            </a>
          )}
        </div>
      </div>
    );
  };

  // ── Submit handler ─────────────────────────────────────
  const handleSubmitPayment = async () => {
    setLoading(true);
    try {
      // Simulate API call (in full app: api.payments.processPayment.mutate(...))
      await new Promise(r => setTimeout(r, scenario === "timeout" ? 5500 : 1200 + Math.random() * 800));

      if (scenario === "timeout") {
        setResult({ type: "timeout" });
      } else if (scenario === "decline") {
        setResult({ type: "declined", declineReason: "כרטיס אשראי אינו בתוקף" });
      } else if (scenario === "random") {
        const r = Math.random();
        if (r < 0.7) {
          setResult({ type: "success", invoiceNumber: `INV-${Date.now()}`, transactionId: `GW-${Math.random().toString(36).substr(2, 16).toUpperCase()}` });
        } else if (r < 0.9) {
          setResult({ type: "declined", declineReason: "אשראי לא מספיק" });
        } else {
          setResult({ type: "timeout" });
        }
      } else {
        setResult({ type: "success", invoiceNumber: `INV-${Date.now()}`, transactionId: `GW-${Math.random().toString(36).substr(2, 16).toUpperCase()}` });
      }
      setStep(4);
    } catch {
      setResult({ type: "error", message: "שגיאה פנימית" });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BackButton />
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-black text-white mb-1">
          ביצוע תשלום
        </h1>
        <p className="text-white/50">תהליך תשלום מאובטח הכולל את כל שלבי האימות והסליקה</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <StepIndicator current={step} />

        <div className="glass-card p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
}
