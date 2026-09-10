"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  User,
  Camera,
  Map,
  LayoutDashboard,
  Award,
  TrendingUp,
  Loader2,
  Mail,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  LogOut,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, civicScore, role, loading, logout } = useAuth();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  // Judge Demo: Switch between Citizen and Municipal Officer
  const handleBecomeOfficial = async () => {
    if (!user) return;
    setIsSwitching(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { role: "official" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to upgrade role:", error);
      setIsSwitching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest animate-pulse">
          Loading Profile...
        </p>
      </div>
    );
  }

  // Simple Level Calculator
  const getUserLevel = (score: number) => {
    if (score >= 1000) return "City Guardian 🏆";
    if (score >= 500) return "Urban Hero ⭐";
    if (score >= 100) return "Active Citizen 🌟";
    return "New Citizen 🌱";
  };

  const getLevelBadge = (score: number) => {
    if (score >= 1000) return "bg-rose-50 text-rose-700 border-rose-100";
    if (score >= 500) return "bg-amber-50 text-amber-700 border-amber-100";
    if (score >= 100) return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-slate-50 text-slate-500 border-slate-200";
  };

  const levelName = getUserLevel(civicScore || 0);
  const progress = Math.min(100, Math.max(10, ((civicScore || 0) / 500) * 100));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-6 relative z-10"
      >
        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Sub Header Badge */}
          <div className="flex items-center gap-2 mb-6 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> My Profile
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 rounded-2xl border-2 border-blue-100 overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-slate-400" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-1.5 shadow-md border-2 border-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user.displayName || "User"}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    role === "official"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}
                >
                  {role === "official" ? "MUNICIPAL OFFICER" : "CITIZEN"}
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-500 font-semibold">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{user.email}</span>
              </div>

              {/* User Level */}
              <div className="pt-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getLevelBadge(
                    civicScore || 0
                  )}`}
                >
                  <Award className="h-3.5 w-3.5" />
                  {levelName}
                </span>
              </div>

              {/* Judge Demo Role Switch Button */}
              {role !== "official" && (
                <div className="pt-3">
                  <button
                    onClick={handleBecomeOfficial}
                    disabled={isSwitching}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-sm"
                  >
                    {isSwitching ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5 text-blue-500" />
                    )}
                    <span>
                      {isSwitching
                        ? "Switching..."
                        : "Judge Demo: Switch to Municipal Officer View"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Total Points */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center min-w-[160px] shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Points
              </span>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 font-mono">
                {civicScore || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mt-1">
                Earned Points
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Level Progress
            </span>
            <span className="text-slate-500 font-semibold">{civicScore || 0} / 500 Points</span>
          </div>

          <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>New Citizen</span>
            <span>City Guardian (500 PTS)</span>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/report"
            className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl p-6 flex items-center justify-between transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Report an Issue</h3>
                <p className="text-xs text-slate-400 font-semibold">Upload a photo and notify officials</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/map"
            className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl p-6 flex items-center justify-between transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
                <Map className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Live Map</h3>
                <p className="text-xs text-slate-400 font-semibold">View reported issues near you</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Officials-only Command Shortcut */}
        {role === "official" && (
          <Link
            href="/dashboard"
            className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl p-6 flex items-center justify-between transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Municipal Dashboard</h3>
                <p className="text-xs text-slate-400 font-semibold">Manage reported issues & download PDF reports</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>
        )}

        {/* Security & Logout Footer */}
        <div className="pt-4 flex justify-between items-center border-t border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <KeyRound className="h-3.5 w-3.5 text-slate-400" />
            <span>User ID: {user.uid.substring(0, 10)}...</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}