"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  PlusCircle, 
  Map, 
  LayoutDashboard, 
  Award, 
  HelpCircle, 
  UserCircle 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, role, civicScore, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 text-slate-800 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10 group-hover:opacity-95 transition-all">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
              Infra<span className="text-blue-600">Shield</span>
            </span>
            <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
              Smart City Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Citizens see Report Issue */}
          {role !== "official" && (
            <Link
              href="/report"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive("/report")
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Report Issue
            </Link>
          )}

          {/* Live Map */}
          <Link
            href="/map"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive("/map")
                ? "bg-blue-50 text-blue-600 border border-blue-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Map className="h-4 w-4" />
            Live Map
          </Link>

          {/* Municipal Officers see Dashboard */}
          {role === "official" && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive("/dashboard")
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}

          {/* Leaderboard */}
          <Link
            href="/leaderboard"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive("/leaderboard")
                ? "bg-blue-50 text-blue-600 border border-blue-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Award className="h-4 w-4" />
            Leaderboard
          </Link>

          {/* How It Works */}
          <Link
            href="/how-it-works"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive("/how-it-works")
                ? "bg-blue-50 text-blue-600 border border-blue-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            How It Works
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">
                  {user.displayName || "User"}
                </span>
                <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-widest mt-0.5">
                  {role === "official" ? "MUNICIPAL OFFICER" : "CITIZEN"} • {civicScore || 0} PTS
                </span>
              </div>

              <Link
                href="/profile"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 transition-all"
                title="My Profile"
              >
                <UserCircle className="h-5 w-5" />
              </Link>

              <button
                onClick={logout}
                className="text-xs font-bold text-slate-400 hover:text-rose-600 px-2 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}