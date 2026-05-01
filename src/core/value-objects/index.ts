/**
 * Value Objects — Domain Layer (Zero external dependencies)
 * CyberService ESM System
 */

// ──────────────────────────────────────────────
// OrderStatus (UC017, UC037, UC040)
// ──────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: "PENDING",
  WAITING_PAYMENT: "WAITING_PAYMENT",
  PAID: "PAID",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// ──────────────────────────────────────────────
// UserRole
// ──────────────────────────────────────────────
export const USER_ROLE = {
  CLIENT: "CLIENT",
  SERVICE_REP: "SERVICE_REP",
  CYBER_ADVISOR: "CYBER_ADVISOR",
  TEAM_MANAGER: "TEAM_MANAGER",
  FINANCE_MANAGER: "FINANCE_MANAGER",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
} as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ──────────────────────────────────────────────
// SLA Level
// ──────────────────────────────────────────────
export const SLA_LEVEL = {
  CRITICAL: "CRITICAL",   // < 4h response
  HIGH: "HIGH",           // < 8h response
  MEDIUM: "MEDIUM",       // < 24h response
  LOW: "LOW",             // < 72h response
} as const;
export type SLALevel = (typeof SLA_LEVEL)[keyof typeof SLA_LEVEL];

export const SLA_RESPONSE_HOURS: Record<SLALevel, number> = {
  CRITICAL: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

// ──────────────────────────────────────────────
// Money (immutable value object)
// ──────────────────────────────────────────────
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string = "ILS"
  ) {
    if (_amount < 0) throw new Error("Money amount cannot be negative");
  }

  static of(amount: number, currency = "ILS"): Money {
    return new Money(amount, currency);
  }

  get amount(): number { return this._amount; }
  get currency(): string { return this._currency; }

  add(other: Money): Money {
    if (this._currency !== other._currency)
      throw new Error("Cannot add different currencies");
    return Money.of(this._amount + other._amount, this._currency);
  }

  format(): string {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: this._currency,
    }).format(this._amount);
  }
}

// ──────────────────────────────────────────────
// PaymentMethod
// ──────────────────────────────────────────────
export const PAYMENT_METHOD = {
  CREDIT_CARD: "CREDIT_CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  CHECK: "CHECK",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

// ──────────────────────────────────────────────
// ServiceCategory
// ──────────────────────────────────────────────
export const SERVICE_CATEGORY = {
  PENETRATION_TEST: "PENETRATION_TEST",
  SECURITY_AUDIT: "SECURITY_AUDIT",
  INCIDENT_RESPONSE: "INCIDENT_RESPONSE",
  TRAINING: "TRAINING",
  COMPLIANCE: "COMPLIANCE",
  MONITORING: "MONITORING",
} as const;
export type ServiceCategory = (typeof SERVICE_CATEGORY)[keyof typeof SERVICE_CATEGORY];

// ──────────────────────────────────────────────
// RiskLevel
// ──────────────────────────────────────────────
export const RISK_LEVEL = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  INFORMATIONAL: "INFORMATIONAL",
} as const;
export type RiskLevel = (typeof RISK_LEVEL)[keyof typeof RISK_LEVEL];

// ──────────────────────────────────────────────
// PaymentTransactionStatus
// ──────────────────────────────────────────────
export const TRANSACTION_STATUS = {
  INITIATED: "INITIATED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  TIMEOUT: "TIMEOUT",
  ROLLED_BACK: "ROLLED_BACK",
} as const;
export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];
