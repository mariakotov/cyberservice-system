import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberService ESM — מערכת ניהול שירותי סייבר",
  description:
    "פלטפורמה מתקדמת לניהול שירותי אבטחת מידע, מעקב SLA בזמן אמת, ועיבוד תשלומים מאובטח.",
  keywords: ["cyberservice", "ESM", "cybersecurity", "SLA", "management"],
  openGraph: {
    title: "CyberService ESM",
    description: "Gold Standard Cybersecurity Service Management Platform",
    type: "website",
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&family=Geist:wght@300;400;600;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-midnight antialiased">
        <Providers>
          {/* Ambient background orbs */}
          <div
            className="fixed pointer-events-none"
            style={{
              top: "10%", right: "5%",
              width: "500px", height: "500px",
              background: "radial-gradient(circle, rgba(0,200,255,0.06) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
          <div
            className="fixed pointer-events-none"
            style={{
              bottom: "10%", left: "5%",
              width: "400px", height: "400px",
              background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
