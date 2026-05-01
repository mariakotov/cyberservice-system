/**
 * Domain Entities — CyberService ESM
 * Clean Architecture: NO imports from infrastructure or app layers
 */

import type {
  OrderStatus,
  UserRole,
  SLALevel,
  PaymentMethod,
  ServiceCategory,
  RiskLevel,
  TransactionStatus,
} from "@/core/value-objects";

// ──────────────────────────────────────────────
// User Entity (UC001–UC010)
// ──────────────────────────────────────────────
export interface UserEntity {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  company?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// Service Entity (UC011–UC016)
// ──────────────────────────────────────────────
export interface ServiceEntity {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  pricePerHour: number;
  estimatedHours: number;
  slaLevel: SLALevel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// Order Entity (UC017–UC019)
// ──────────────────────────────────────────────
export interface OrderEntity {
  id: string;
  orderNumber: string;
  clientId: string;
  serviceId: string;
  assignedAdvisorId?: string;
  status: OrderStatus;
  scheduledDate?: Date;
  completedDate?: Date;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// Task Entity (UC021–UC030)
// ──────────────────────────────────────────────
export interface TaskEntity {
  id: string;
  orderId: string;
  advisorId: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  progress: number; // 0-100
  dueDate?: Date;
  completedAt?: Date;
  hoursLogged: number;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// Risk Finding Entity (UC033–UC036)
// ──────────────────────────────────────────────
export interface RiskFindingEntity {
  id: string;
  orderId: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  affectedSystem: string;
  recommendation: string;
  status: "OPEN" | "IN_REMEDIATION" | "RESOLVED";
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// Risk Report Entity (UC033–UC035)
// ──────────────────────────────────────────────
export interface RiskReportEntity {
  id: string;
  orderId: string;
  clientId: string;
  title: string;
  executiveSummary: string;
  findings: RiskFindingEntity[];
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED";
  createdByAdvisorId: string;
  approvedByManagerId?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// Payment Transaction Entity (UC037–UC041)
// ──────────────────────────────────────────────
export interface PaymentTransactionEntity {
  id: string;
  orderId: string;
  clientId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  gatewayTransactionId?: string;
  gatewayResponse?: string;
  cardLastFour?: string;        // Only last 4 digits stored (PCI-DSS)
  cardBrand?: string;
  initiatedAt: Date;
  completedAt?: Date;
  rollbackAt?: Date;
  auditLog: AuditLogEntry[];
}

// ──────────────────────────────────────────────
// Invoice Entity (UC039)
// ──────────────────────────────────────────────
export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  orderId: string;
  paymentTransactionId: string;
  clientId: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  issuedAt: Date;
  dueDate: Date;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ──────────────────────────────────────────────
// Subscription Entity (UC018, UC038)
// ──────────────────────────────────────────────
export interface SubscriptionEntity {
  id: string;
  clientId: string;
  planName: string;
  monthlyAmount: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  nextBillingDate: Date;
  createdAt: Date;
}

// ──────────────────────────────────────────────
// Audit Log Entry
// ──────────────────────────────────────────────
export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details: string;
  ipAddress?: string;
}

// ──────────────────────────────────────────────
// Support Ticket Entity (UC042–UC043)
// ──────────────────────────────────────────────
export interface SupportTicketEntity {
  id: string;
  ticketNumber: string;
  clientId: string;
  assignedAdvisorId?: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// ──────────────────────────────────────────────
// Service Rating Entity (UC044)
// ──────────────────────────────────────────────
export interface ServiceRatingEntity {
  id: string;
  orderId: string;
  clientId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: Date;
}
