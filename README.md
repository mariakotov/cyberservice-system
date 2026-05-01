# 🛡️ CyberService ESM — Gold Standard

> **מערכת לניהול שירותי אבטחת מידע** | Enterprise Service Management Platform for Cybersecurity

[**🚀 View Live Demo**](https://cyberservice-system-live.vercel.app/)


[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-v11-2596be?logo=trpc)](https://trpc.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 תוכן עניינים

- [סקירה כללית](#-סקירה-כללית)
- [ארכיטקטורה](#-ארכיטקטורה)
- [50 Use Cases](#-50-use-cases)
- [UC037 — תרחיש תשלום](#-uc037--תרחיש-תשלום-מלא)
- [התקנה והפעלה](#-התקנה-והפעלה)
- [מבנה הפרויקט](#-מבנה-הפרויקט)
- [שחקנים](#-שחקנים)
- [Agents & Skills](#-agents--skills)
- [אבטחה](#-אבטחה)

---

## 🌐 סקירה כללית

**CyberService ESM** היא פלטפורמה לניהול מחזור החיים המלא של שירותי אבטחת מידע ללקוחות עסקיים — מרישום ראשוני, דרך ביצוע שירות על ידי יועץ סייבר, ועד הפקת דוח סיכונים ותשלום מאובטח.

### ✨ תכונות עיקריות

| תכונה | פרטים |
|---|---|
| **50 Use Cases** | UC001–UC050 מיושמים ב-Clean Architecture |
| **Dark Glassmorphism UI** | Bento Grid + מיקרו-אנימציות + RTL |
| **UC037 Payment** | תהליך תשלום מלא עם כל הזרמים החלופיים |
| **SLA Tracking** | מעקב בזמן אמת עם ring charts |
| **Security Audit Agent** | בדיקות PCI-DSS, ISO27001, GDPR, NIST |
| **6 תפקידים** | RBAC מלא לכל שחקן בשיטה |
| **Server Components** | RSC לשליפת נתונים מהשרת |

---

## 🏗️ ארכיטקטורה

### Clean Architecture Layers

```mermaid
graph TD
    subgraph UI["🖥️ Presentation Layer (Next.js 15 App Router)"]
        RSC["React Server Components\n(data fetching)"]
        RCC["React Client Components\n(Zustand state)"]
        LOGIN["Login Page\n(UC001-UC007)"]
    end

    subgraph API["🔌 API Layer (tRPC v11)"]
        ROUTER["App Router\n/api/trpc"]
        AUTH["Auth Router\n(NextAuth v5)"]
        PAY["Payments Router\n(UC037-UC041)"]
        DASH["Dashboard Router\n(UC046)"]
    end

    subgraph DOMAIN["🧠 Domain Layer (Zero Dependencies)"]
        ENTITIES["Entities\nUser, Order, Invoice, Task..."]
        USECASES["Use Cases\nUC001–UC050"]
        INTERFACES["Interfaces\nIRepository, IGateway"]
        VOBJECTS["Value Objects\nMoney, SLA, OrderStatus"]
    end

    subgraph INFRA["🗄️ Infrastructure Layer"]
        DB["Drizzle ORM\n(SQLite/LibSQL)"]
        GW["Mock Payment Gateway\n(PCI-DSS Compliant)"]
        NOTIF["Notification Service\n(Mock)"]
    end

    subgraph AGENTS[".agents/skills"]
        SLA["SLA Calculator\n(Real-time tracking)"]
        SEC["Security Auditor\n(UC036 alerts)"]
    end

    UI --> API
    API --> DOMAIN
    DOMAIN --> INFRA
    DOMAIN --> AGENTS
    INFRA --> DB
    INFRA --> GW
    INFRA --> NOTIF
```

### Technology Stack

```mermaid
graph LR
    A[Next.js 15] --> B[tRPC v11]
    B --> C[Drizzle ORM]
    C --> D[(SQLite/LibSQL)]
    A --> E[Zustand v5]
    A --> F[NextAuth.js v5]
    A --> G[Tailwind CSS v4]
    G --> H[Glassmorphism Theme]
```

---

## 📊 50 Use Cases

| # | קטגוריה | Use Cases |
|---|---|---|
| UC001–UC010 | **ניהול משתמשים** | רישום, התחברות, עדכון, הרשאות, השבתה |
| UC011–UC020 | **ניהול שירותים** | קטלוג, הזמנה, ביטול, מנוי, יומן |
| UC021–UC032 | **ביצוע שירות** | מעקב, הקצאה, עדכון, תיעוד שעות, ממצאים |
| UC033–UC036 | **דוחות סיכונים** | טיוטה, אישור, פרסום, התראת ממצא קריטי |
| UC037–UC041 | **תשלומים** | תשלום, מנויים, קבלה, החזר, היסטוריה |
| UC042–UC045 | **שירות לקוח** | פנייה, טיפול, משוב, דירוג |
| UC046–UC050 | **ניהול מערכת** | לוח בקרה, דוחות, DB ops |

---

## 💳 UC037 — תרחיש תשלום מלא

### Sequence Diagram

```mermaid
sequenceDiagram
    actor U as לקוח / נציג שירות
    participant S as מערכת CyberService
    participant GW as מערכת תשלומים (Clearing)
    participant DB as בסיס נתונים
    participant N as מערכת התראות

    Note over U,N: Normal Flow (7 Steps)

    U->>S: בחירת הזמנה ממתינה לתשלום (Step 1)
    S->>DB: שליפת פרטי הזמנה + חיוב
    DB-->>S: סיכום חיוב + פרטי שירות
    S-->>U: הצגת סיכום (Step 2)

    U->>S: הזנת פרטי אמצעי תשלום (Step 3)
    S->>S: אימות פורמט קלט (Step 4)
    S-->>U: כפתור "אשר ושלח לסליקה"

    S->>GW: שליחת בקשת תשלום + Idempotency Key (Step 5)

    alt אישור (Normal Flow)
        GW-->>S: אישור + Transaction ID (Step 6)
        S->>DB: עדכון סטטוס → "שולם" + Audit Log (Step 7)
        S->>N: שליחת קבלה + חשבונית (UC039)
        N-->>U: אישור תשלום + חשבונית
        S-->>U: הצגת הודעת הצלחה
    else דחיית סליקה (Exception 1)
        GW-->>S: סיבת דחייה
        S-->>U: הצגת סיבת דחייה
        U->>S: בחירת אמצעי תשלום חלופי
    else Timeout - תקלת תקשורת (Exception 2)
        Note over GW: אין תגובה תוך 5 שניות
        S->>DB: רישום כ"ממתין" + Audit Log
        S-->>U: הודעה על תקלת תקשורת זמנית
    end

    Note over U,N: Alternative Flow 2 — ביטול משתמש
    U->>S: לחיצה על "ביטול"
    S->>S: Rollback — לא שומר פרטי אשראי
    S-->>U: חזרה למסך הזמנות פעילות
    Note over DB: הסטטוס נותר "ממתין לתשלום"
```

### Business Rules (UC037)

| כלל | פרטים |
|---|---|
| **BR1** | רק בעל ההזמנה או נציג שירות רשאים לבצע תשלום |
| **BR2** | כל ניסיון תשלום מתועד ב-Audit Log |
| **Security** | PCI-DSS · TLS 1.3 · לא שומרים מספר כרטיס מלא |
| **Performance** | SLA: עד 5 שניות לאישור סליקה קצה-לקצה |
| **Reliability** | סנכרון חוזר במקרה ניתוק לפני קבלת אישור |

---

## 🚀 התקנה והפעלה

### דרישות מקדימות

- Node.js ≥ 20
- npm ≥ 10

### שלבי התקנה

```bash
# שלב 1: כניסה לתיקיית הפרויקט
cd cyberservice

# שלב 2: התקנת תלויות
npm install

# שלב 3: הגדרת משתני סביבה
cp .env.example .env.local

# שלב 4: הפעלת שרת פיתוח
npm run dev
```

### כניסה לדמו

פתח `http://localhost:3000` — תועבר אוטומטית למסך הכניסה.

| תפקיד | אימייל | סיסמה |
|---|---|---|
| לקוח | `client@demo.com` | `demo123` |
| נציג שירות | `rep@demo.com` | `demo123` |
| יועץ סייבר | `advisor@demo.com` | `demo123` |
| מנהל צוות | `manager@demo.com` | `demo123` |
| מנהל כספים | `finance@demo.com` | `demo123` |
| מנהל מערכת | `admin@demo.com` | `demo123` |

---

## 📁 מבנה הפרויקט

```
cyberservice/
├── src/
│   ├── core/                          # 🧠 Domain Layer
│   │   ├── entities/index.ts          # User, Order, Invoice, Task...
│   │   ├── value-objects/index.ts     # Money, SLA, OrderStatus, UserRole
│   │   └── usecases/
│   │       └── process-payment.uc037.ts  # UC037 - Complete implementation
│   ├── infrastructure/
│   │   ├── db/
│   │   │   ├── schema.ts              # Drizzle ORM schema (10 tables)
│   │   │   └── client.ts             # SQLite client + seed data
│   │   └── services/
│   │       └── mock-payment-gateway.ts  # Payment simulator (all UC037 flows)
│   ├── server/api/
│   │   ├── trpc.ts                    # tRPC v11 init + role guards
│   │   ├── root.ts                    # App router
│   │   └── routers/
│   │       ├── payments.ts            # UC037-UC041
│   │       └── dashboard.ts          # UC046
│   ├── lib/
│   │   ├── auth.ts                   # NextAuth v5 (6 demo users)
│   │   └── trpc.ts                   # tRPC React client
│   ├── components/
│   │   └── layout/
│   │       └── DashboardSidebar.tsx  # Navigation with UC references
│   └── app/
│       ├── layout.tsx                # Root layout (RTL + Glassmorphism)
│       ├── page.tsx                  # Redirect to dashboard/login
│       ├── login/page.tsx            # Login with role quick-switch
│       ├── dashboard/
│       │   ├── page.tsx             # RSC data fetching
│       │   ├── DashboardClient.tsx  # Bento Grid UI
│       │   └── payments/page.tsx   # UC037 multi-step wizard
│       └── api/
│           ├── trpc/[trpc]/route.ts # tRPC API handler
│           └── auth/[...nextauth]/  # NextAuth handler
├── .agents/
│   └── skills/
│       ├── sla-calculator.ts        # SLA compliance engine
│       └── security-auditor.ts     # PCI-DSS/ISO27001/GDPR checks
└── README.md
```

---

## 👥 שחקנים

```mermaid
graph TD
    Abstract["🧑 Abstract Actor\n(System User)"]

    Client["👤 לקוח\nClient"]
    Rep["🎧 נציג שירות\nService Rep"]
    Advisor["🔒 יועץ סייבר\nCyber Advisor"]
    Manager["📊 מנהל צוות\nTeam Manager"]
    Finance["💳 מנהל כספים\nFinance Manager"]
    Admin["⚙️ מנהל מערכת\nSystem Admin"]

    Abstract --> Client
    Abstract --> Rep
    Abstract --> Advisor
    Abstract --> Manager
    Abstract --> Finance
    Abstract --> Admin

    PaySys["💳 מערכת תשלומים"]
    NotifSys["🔔 מערכת התראות"]
    ReportSys["📄 מערכת דוחות"]
    DB["🗄️ בסיס נתונים"]
```

---

## 🤖 Agents & Skills

### SLA Calculator (`.agents/skills/sla-calculator.ts`)

```typescript
const slaResult = slaCalculator.calculate({
  orderId: "ord-001",
  slaLevel: "CRITICAL",   // 4h response SLA
  createdAt: new Date("2026-05-01T10:00:00Z"),
  status: "IN_PROGRESS",
});
// → { compliancePercent: 45, status: "AT_RISK", remainingHours: 1.8 }
```

### Security Auditor (`.agents/skills/security-auditor.ts`)

```typescript
const report = securityAuditor.runAudit();
// → { score: 82, passed: 12, failed: 4, overallStatus: "AT_RISK" }

const alerts = securityAuditor.generateCriticalAlerts(report);
// → ["🚨 CRITICAL: Admin interface exposed to internet..."]
```

---

## 🔐 אבטחה

| דרישה | יישום |
|---|---|
| PCI-DSS | רק 4 ספרות אחרונות של כרטיס נשמרות |
| TLS 1.3 | מוגדר ב-Next.js deployment |
| RBAC | `roleGuard()` על כל endpoint רגיש |
| Audit Log | כל ניסיון תשלום מתועד (UC037 BR2) |
| Idempotency | מניעת חיוב כפול בתקשורת לא יציבה |
| Input Validation | Zod schema על כל ה-tRPC inputs |
| Session Security | JWT עם expire של 30 דקות |

---

## 👩‍💻 Author

Maria Kotov  
Information Systems & Business Administration Student | Tech Operations Professional  
Focusing on data-driven systems and functional digital solutions.

[LinkedIn](https://www.linkedin.com/in/maria-kotov-005116269/) | [GitHub](https://github.com/mariakotov)

---
*Crafted with precision for modern information systems.*
