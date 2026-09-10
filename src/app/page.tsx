"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  Camera, 
  Map, 
  Cpu, 
  FileText, 
  Layers, 
  TrendingDown, 
  Hammer, 
  CheckCircle2, 
  Activity,
  History,
  Lock,
  Sparkles,
  Zap,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

// Interface for Gemini AI Assessment Result
interface GeminiAuditResult {
  priority?: {
    score?: number;
    level?: string;
  };
  recommendation?: {
    department?: string;
    actionRequired?: string;
  };
  summary?: string;
}

export default function LandingPage() {
  const { role } = useAuth();

  // Modal State for dynamic Gemini AI response presentation
  const [result, setResult] = useState<GeminiAuditResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white overflow-hidden relative">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white border-b border-slate-200">
        {/* Soft Modern Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Platform Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-600 animate-pulse" /> Enterprise Municipal Intelligence Core
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
          >
            Autonomous Infrastructure Audit &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
              Risk Diagnostics Core
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed font-medium"
          >
            An enterprise-grade inspect-to-resolve agentic platform. Scan structural anomalies with multimodal vision models, rank severity indices, and auto-dispatch prioritized work orders.
          </motion.p>

          {/* Action Call-to-actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {role !== "official" && (
              <Link
                href="/report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Camera className="h-4 w-4" />
                Report a Defect
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Map className="h-4 w-4 text-indigo-600" />
              Explore GIS Hazard Map
            </Link>

            {role === "official" && (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Cpu className="h-4 w-4" />
                Inspector Command Center
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. REAL-TIME STATS GRID */}
      <section className="border-b border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-mono">&lt; 2.0s</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gemini Audit Latency</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-mono">0–100</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Risk Priority Matrix</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 font-mono">₹1.25L</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Proactive ROI/Fix</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600 font-mono">6 Agents</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Collaboration Layer</p>
          </div>

        </div>
      </section>

      {/* 3. CAPABILITIES GRID */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Core Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Structural Health Suite
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Autonomous multi-agent workflows engineered for high-precision municipal governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-indigo-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">1. Image Defect Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Gemini Vision analyzes defect photos in under 2 seconds. Identifies structural cracks, spalling, potholes, and leakages.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-purple-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">2. Parallel Multimodal Agents</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Parallel execution of Vision Assessor, Logistics Planner, Anti-Spam validator, and Comms Lead.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-pink-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">3. 0–100 Severity Score</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rigid priority scoring incorporating environmental proximity, transit safety indicators, and degradation speed.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-blue-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">4. Live GIS Defect Map</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive Leaflet satellite overlay with geocoding, radius clustering, and color-coded severity pin markers.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-violet-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">5. Maintenance Audit Logs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chronological site timeline logs capturing previous inspections, action statuses, and localized deterioration history.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-emerald-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Hammer className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">6. Resource Allocation Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Priority queuing that calculates required crew personnel manifests, heavy machinery needs, and material cost manifests.
            </p>
          </div>

          {/* Card 7 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-cyan-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">7. PDF Engineering Export</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1-Click automated report generation complete with photo evidence, metadata parameters, and sign-off spaces.
            </p>
          </div>

          {/* Card 8 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-teal-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">8. Taxpayer ROI Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analytical dashboard visualizing department distributions, repair timelines, and proactive capital-saved metrics.
            </p>
          </div>

          {/* Card 9 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-3 hover:border-rose-400 hover:shadow-md transition-all duration-300 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Security & Anti-Spam Gate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Role-based secure views + neural image filter that rejects selfies and random photos with absolute zero-point outputs.
            </p>
          </div>

        </div>
      </section>

      {/* 4. QUICK ACCESS BAR */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">
              Platform Navigation
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Rapid System Access Terminal
            </h3>
            <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium">
              Access live citizen reporting screens, active GIS sensor markers, and chief engineer diagnostics instantly.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/how-it-works"
              className="px-5 py-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              📖 Engineering Pipeline Spec
            </Link>
            <Link
              href="/map"
              className="px-5 py-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              🗺️ Open Active GIS Overlay
            </Link>
            <Link
              href="/login"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors shadow-md shadow-indigo-600/20"
            >
              🔐 Authenticate / Role Bypass
            </Link>
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC REPORT COMPLETION MODAL */}
      <AnimatePresence>
        {isModalOpen && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-center"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-5">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              {/* Dynamic Modal Content Section */}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {(result.priority?.score ?? 0) >= 50
                  ? "Report Submitted! (+50 PTS)"
                  : "Report Received"}
              </h3>

              <p className="text-base text-slate-600 mb-4">
                AI Urgency Score:{" "}
                <span className="font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-lg border border-sky-200">
                  {result.priority?.score ?? 50} / 100
                </span>
              </p>

              <p className="text-sm text-slate-500 mb-2">
                Department Assigned:{" "}
                <span className="font-semibold text-slate-800">
                  {result.recommendation?.department || "Public Works Department"}
                </span>
              </p>

              <div className="pt-6 border-t border-slate-100 mt-6 flex justify-center">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}