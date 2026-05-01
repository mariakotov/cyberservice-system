/**
 * NextAuth.js v5 Configuration — CyberService ESM
 * Credentials provider with demo users for all 6 roles
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// Demo users for all roles (in production: bcrypt + database lookup)
const DEMO_USERS = [
  { id: "usr_client",   email: "client@demo.com",   password: "demo123", name: "דני כהן",       role: "CLIENT",           company: "הייטק בע״מ" },
  { id: "usr_rep",      email: "rep@demo.com",       password: "demo123", name: "מיכל לוי",      role: "SERVICE_REP",      company: "CyberService" },
  { id: "usr_advisor",  email: "advisor@demo.com",   password: "demo123", name: "יובל שפירא",    role: "CYBER_ADVISOR",    company: "CyberService" },
  { id: "usr_manager",  email: "manager@demo.com",   password: "demo123", name: "שרה גולדברג",   role: "TEAM_MANAGER",     company: "CyberService" },
  { id: "usr_finance",  email: "finance@demo.com",   password: "demo123", name: "אריה רוזנברג",  role: "FINANCE_MANAGER",  company: "CyberService" },
  { id: "usr_admin",    email: "admin@demo.com",      password: "demo123", name: "נועה ברק",      role: "SYSTEM_ADMIN",     company: "CyberService" },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "אימייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }).safeParse(credentials);

        if (!parsed.success) return null;

        const user = DEMO_USERS.find(
          u => u.email === parsed.data.email && u.password === parsed.data.password
        );
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.company = (user as any).company;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).company = token.company;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "cyberservice-dev-secret-2026",
  session: { strategy: "jwt" },
});
