/**
 * Drizzle ORM Schema — CyberService ESM
 * SQLite (local demo), migrate to PostgreSQL for production
 */

import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", {
    enum: ["CLIENT","SERVICE_REP","CYBER_ADVISOR","TEAM_MANAGER","FINANCE_MANAGER","SYSTEM_ADMIN"],
  }).notNull().default("CLIENT"),
  phone: text("phone"),
  company: text("company"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

// ──────────────────────────────────────────────
// Services (catalog)
// ──────────────────────────────────────────────
export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category", {
    enum: ["PENETRATION_TEST","SECURITY_AUDIT","INCIDENT_RESPONSE","TRAINING","COMPLIANCE","MONITORING"],
  }).notNull(),
  pricePerHour: real("price_per_hour").notNull(),
  estimatedHours: real("estimated_hours").notNull(),
  slaLevel: text("sla_level", {
    enum: ["CRITICAL","HIGH","MEDIUM","LOW"],
  }).notNull().default("MEDIUM"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

// ──────────────────────────────────────────────
// Orders
// ──────────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  clientId: text("client_id").notNull().references(() => users.id),
  serviceId: text("service_id").notNull().references(() => services.id),
  assignedAdvisorId: text("assigned_advisor_id").references(() => users.id),
  status: text("status", {
    enum: ["PENDING","WAITING_PAYMENT","PAID","IN_PROGRESS","COMPLETED","CANCELLED","REFUNDED"],
  }).notNull().default("PENDING"),
  scheduledDate: text("scheduled_date"),
  completedDate: text("completed_date"),
  totalAmount: real("total_amount").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

// ──────────────────────────────────────────────
// Tasks
// ──────────────────────────────────────────────
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  advisorId: text("advisor_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: integer("priority").notNull().default(3),
  progress: integer("progress").notNull().default(0),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  hoursLogged: real("hours_logged").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

// ──────────────────────────────────────────────
// Payment Transactions
// ──────────────────────────────────────────────
export const paymentTransactions = sqliteTable("payment_transactions", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  clientId: text("client_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("ILS"),
  paymentMethod: text("payment_method", {
    enum: ["CREDIT_CARD","BANK_TRANSFER","CHECK"],
  }).notNull(),
  status: text("status", {
    enum: ["INITIATED","PENDING","APPROVED","DECLINED","TIMEOUT","ROLLED_BACK"],
  }).notNull().default("INITIATED"),
  gatewayTransactionId: text("gateway_transaction_id"),
  gatewayResponse: text("gateway_response"),
  cardLastFour: text("card_last_four"),      // PCI-DSS: ONLY last 4 digits
  cardBrand: text("card_brand"),
  initiatedAt: text("initiated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  completedAt: text("completed_at"),
  rollbackAt: text("rollback_at"),
  auditLog: text("audit_log", { mode: "json" }).$type<object[]>().notNull().default([]),
});

// ──────────────────────────────────────────────
// Invoices
// ──────────────────────────────────────────────
export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: text("order_id").notNull().references(() => orders.id),
  paymentTransactionId: text("payment_transaction_id").notNull().references(() => paymentTransactions.id),
  clientId: text("client_id").notNull().references(() => users.id),
  lineItems: text("line_items", { mode: "json" }).$type<object[]>().notNull().default([]),
  subtotal: real("subtotal").notNull(),
  tax: real("tax").notNull(),
  total: real("total").notNull(),
  currency: text("currency").notNull().default("ILS"),
  issuedAt: text("issued_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  dueDate: text("due_date").notNull(),
});

// ──────────────────────────────────────────────
// Risk Reports
// ──────────────────────────────────────────────
export const riskReports = sqliteTable("risk_reports", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  clientId: text("client_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  findings: text("findings", { mode: "json" }).$type<object[]>().notNull().default([]),
  status: text("status", {
    enum: ["DRAFT","PENDING_APPROVAL","APPROVED","PUBLISHED"],
  }).notNull().default("DRAFT"),
  createdByAdvisorId: text("created_by_advisor_id").notNull().references(() => users.id),
  approvedByManagerId: text("approved_by_manager_id").references(() => users.id),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

// ──────────────────────────────────────────────
// Support Tickets
// ──────────────────────────────────────────────
export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  clientId: text("client_id").notNull().references(() => users.id),
  assignedAdvisorId: text("assigned_advisor_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["OPEN","IN_PROGRESS","RESOLVED","CLOSED"],
  }).notNull().default("OPEN"),
  priority: text("priority", {
    enum: ["LOW","MEDIUM","HIGH","CRITICAL"],
  }).notNull().default("MEDIUM"),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  resolvedAt: text("resolved_at"),
});

// ──────────────────────────────────────────────
// Subscriptions
// ──────────────────────────────────────────────
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => users.id),
  planName: text("plan_name").notNull(),
  monthlyAmount: real("monthly_amount").notNull(),
  currency: text("currency").notNull().default("ILS"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  nextBillingDate: text("next_billing_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

// ──────────────────────────────────────────────
// Service Ratings
// ──────────────────────────────────────────────
export const serviceRatings = sqliteTable("service_ratings", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  clientId: text("client_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export type Schema = {
  users: typeof users;
  services: typeof services;
  orders: typeof orders;
  tasks: typeof tasks;
  paymentTransactions: typeof paymentTransactions;
  invoices: typeof invoices;
  riskReports: typeof riskReports;
  supportTickets: typeof supportTickets;
  subscriptions: typeof subscriptions;
  serviceRatings: typeof serviceRatings;
};
