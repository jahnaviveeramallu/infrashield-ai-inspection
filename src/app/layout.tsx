import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InfraShield AI — Autonomous Infrastructure Inspection & Risk Engine",
  description: "Multimodal AI platform for infrastructure defect detection, 0–100 risk scoring, and resource maintenance prioritization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f8fafc] text-slate-800 antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-100 bg-white py-6 px-4 text-center text-xs font-semibold font-mono text-slate-400">
            <p>🛡️ InfraShield AI — Autonomous Infrastructure Inspection & Maintenance Prioritization Engine</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}