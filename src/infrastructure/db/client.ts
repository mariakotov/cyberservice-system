/**
 * Database client + seed data
 * Uses better-sqlite3 for local development (zero infra)
 */

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { randomUUID } from "crypto";

const DB_PATH = ":memory:";

// Singleton connection
const sqlite = new Database(DB_PATH);
// In-memory doesn't need WAL
// sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Initialize schema immediately for in-memory DB
initializeDatabase();
seedDatabase();

// ──────────────────────────────────────────────
// Create tables (run once on startup)
// ──────────────────────────────────────────────
export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CLIENT',
      phone TEXT,
      company TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price_per_hour REAL NOT NULL,
      estimated_hours REAL NOT NULL,
      sla_level TEXT NOT NULL DEFAULT 'MEDIUM',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL REFERENCES users(id),
      service_id TEXT NOT NULL REFERENCES services(id),
      assigned_advisor_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'PENDING',
      scheduled_date TEXT,
      completed_date TEXT,
      total_amount REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      advisor_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 3,
      progress INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      completed_at TEXT,
      hours_logged REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      client_id TEXT NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ILS',
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'INITIATED',
      gateway_transaction_id TEXT,
      gateway_response TEXT,
      card_last_four TEXT,
      card_brand TEXT,
      initiated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      completed_at TEXT,
      rollback_at TEXT,
      audit_log TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      order_id TEXT NOT NULL REFERENCES orders(id),
      payment_transaction_id TEXT NOT NULL REFERENCES payment_transactions(id),
      client_id TEXT NOT NULL REFERENCES users(id),
      line_items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ILS',
      issued_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      due_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS risk_reports (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      client_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      executive_summary TEXT NOT NULL,
      findings TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'DRAFT',
      created_by_advisor_id TEXT NOT NULL REFERENCES users(id),
      approved_by_manager_id TEXT REFERENCES users(id),
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      ticket_number TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL REFERENCES users(id),
      assigned_advisor_id TEXT REFERENCES users(id),
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES users(id),
      plan_name TEXT NOT NULL,
      monthly_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ILS',
      start_date TEXT NOT NULL,
      end_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      next_billing_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS service_ratings (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      client_id TEXT NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);
}

// ──────────────────────────────────────────────
// Seed Data — Demo users for all roles
// ──────────────────────────────────────────────
export async function seedDatabase() {
  const existing = sqlite.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (existing.count > 0) return; // Already seeded

  const DEMO_HASH = "demo_hash_not_for_production"; // In prod: bcrypt

  const demoUsers = [
    { id: randomUUID(), email: "client@demo.com",   name: "דני כהן",        role: "CLIENT",           company: "הייטק בע״מ" },
    { id: randomUUID(), email: "rep@demo.com",      name: "מיכל לוי",       role: "SERVICE_REP",      company: "CyberService" },
    { id: randomUUID(), email: "advisor@demo.com",  name: "יובל שפירא",     role: "CYBER_ADVISOR",    company: "CyberService" },
    { id: randomUUID(), email: "manager@demo.com",  name: "שרה גולדברג",    role: "TEAM_MANAGER",     company: "CyberService" },
    { id: randomUUID(), email: "finance@demo.com",  name: "אריה רוזנברג",   role: "FINANCE_MANAGER",  company: "CyberService" },
    { id: randomUUID(), email: "admin@demo.com",    name: "נועה ברק",        role: "SYSTEM_ADMIN",     company: "CyberService" },
  ];

  for (const u of demoUsers) {
    sqlite.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, password_hash, role, company, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(u.id, u.email, u.name, DEMO_HASH, u.role, u.company, "050-0000000");
  }

  // Seed services
  const clientId = demoUsers[0].id;
  const advisorId = demoUsers[2].id;

  const demoServices = [
    { id: randomUUID(), name: "בדיקת חדירה — רשת פנימית", category: "PENETRATION_TEST", price: 350, hours: 16, sla: "HIGH" },
    { id: randomUUID(), name: "ביקורת אבטחה מקיפה", category: "SECURITY_AUDIT", price: 400, hours: 24, sla: "CRITICAL" },
    { id: randomUUID(), name: "תגובה לאירועי סייבר", category: "INCIDENT_RESPONSE", price: 500, hours: 8, sla: "CRITICAL" },
    { id: randomUUID(), name: "הכשרת עובדים — מודעות סייבר", category: "TRAINING", price: 200, hours: 4, sla: "LOW" },
    { id: randomUUID(), name: "עמידה בתקנות GDPR/ISO27001", category: "COMPLIANCE", price: 450, hours: 20, sla: "MEDIUM" },
    { id: randomUUID(), name: "ניטור רציף 24/7", category: "MONITORING", price: 300, hours: 0, sla: "CRITICAL" },
  ];

  for (const s of demoServices) {
    sqlite.prepare(`
      INSERT OR IGNORE INTO services (id, name, description, category, price_per_hour, estimated_hours, sla_level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(s.id, s.name, `שירות מקצועי: ${s.name}`, s.category, s.price, s.hours, s.sla);
  }

  // Seed orders in various statuses
  const orderStatuses = [
    { status: "WAITING_PAYMENT", amount: 5600 },
    { status: "IN_PROGRESS", amount: 9600 },
    { status: "COMPLETED", amount: 4000 },
    { status: "PAID", amount: 8000 },
  ];

  for (let i = 0; i < orderStatuses.length; i++) {
    const orderId = randomUUID();
    const os = orderStatuses[i];
    sqlite.prepare(`
      INSERT OR IGNORE INTO orders (id, order_number, client_id, service_id, assigned_advisor_id, status, total_amount, scheduled_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      `ORD-2026-${String(i + 1).padStart(4, "0")}`,
      clientId,
      demoServices[i % demoServices.length].id,
      advisorId,
      os.status,
      os.amount,
      new Date(Date.now() + i * 86400000).toISOString()
    );
  }

  console.log("✅ Database seeded with demo data");
}
