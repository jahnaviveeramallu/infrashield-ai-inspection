"use client";

import Link from "next/link";
import { 
  Camera, 
  Cpu, 
  Layers, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Briefcase, 
  Megaphone, 
  Hammer, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Sparkles
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Gradient Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-100 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Cpu className="h-3.5 w-3.5 text-purple-600 animate-pulse" /> Technical Pipeline Spec
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            How Infra<span className="text-blue-600">Shield</span> AI Works
          </h1>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium">
            From field image capture to autonomous computer vision diagnostics, parallel multi-agent priority scheduling, and verifiable engineering reports.
          </p>
        </div>

        {/* 4-Step Core Architecture */}
        <div className="space-y-8">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest block">
              End-to-End Operational Lifecycle
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              The 4-Stage Autonomous Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 relative overflow-hidden space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-mono font-bold text-base">
                01
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" /> Photo & Location Intake
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Field inspectors upload photographs. The system auto-captures coordinates using geocoded GPS and triggers an AI anti-spam gateway to block non-civic uploads.
                </p>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 font-mono">
                <li>• Client-side compression (max 800px)</li>
                <li>• Exact GPS geocoding via OpenStreetMap</li>
                <li>• Client-side unique file hash matching</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 relative overflow-hidden space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-mono font-bold text-base">
                02
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-500" /> Multi-Agent AI Diagnostics
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  An uploaded defect is parsed by three specialized agents in parallel: Vision Assessor (root cause), Logistics Planner (repair budget), and Comms Lead (public alerts).
                </p>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 font-mono">
                <li>• 0–100 Hazard Urgency Scoring formula</li>
                <li>• Defect classification (shear crack, spalling)</li>
                <li>• Automated budget estimation in INR (₹)</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 relative overflow-hidden space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-mono font-bold text-base">
                03
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Hammer className="h-5 w-5 text-amber-500" /> Resource Prioritisation
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  The system automatically prioritises work orders based on the aging formula: <code className="bg-slate-100 text-amber-700 px-1 py-0.5 rounded text-xs">Priority = Severity × (1 + Days × 0.1)</code>. Calculates crews and materials.
                </p>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 font-mono">
                <li>• Automated work order ticket allocation</li>
                <li>• Machinery allocation (compactor, jackhammer)</li>
                <li>• Complete material cost manifests</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 relative overflow-hidden space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-mono font-bold text-base">
                04
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" /> Verifiable PDF Reports
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Chief Engineers review the prioritization queue and generate official, signed engineering PDF reports complete with metadata, GPS proof, and signature spaces.
                </p>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 font-mono">
                <li>• jsPDF AutoTable document pipeline</li>
                <li>• Chronological location audit history updates</li>
                <li>• 1-Click municipal resolution & archival</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3 Specialized Agents Layer */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
              AI Multi-Agent Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              The 3-Agent Collaborative Engine
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Every uploaded image is scanned simultaneously by three distinct, specialized Gemini agent nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Agent 1 */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">1. Vision Assessor</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts defect categories (potholes, spalling, drainage blocks), assesses geological cause factors, and outputs a 0–100 risk score.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">2. Logistics Planner</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Routes structural work orders to PWD divisions, recommends immediate temporary barriers, and lists materials in ₹.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Megaphone className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">3. Comms Lead</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compiles 280-character public safety warning alerts with coordinates and drafts internal engineering dispatch emails.
              </p>
            </div>
          </div>
        </div>

        {/* ROI Block */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-100 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-mono font-bold uppercase tracking-wider">
              <TrendingDown className="h-4 w-4" /> Capital-Saved Metrics
            </div>
            <h3 className="text-2xl font-bold text-slate-950">
              Proactive vs Reactive Maintenance ROI
            </h3>
            <p className="text-sm text-slate-500 max-w-xl font-medium">
              By detecting micro-cracks and drainage blockages early, repairs cost ₹15,000–₹45,000, saving municipalities from ₹1.5L–₹5.0L reactive reconstruction charges.
            </p>
          </div>

          <div className="bg-white border border-blue-200 rounded-2xl p-5 text-center min-w-[200px] shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
              Average Capital Saved
            </span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
              ₹1.25L
            </span>
            <span className="text-[11px] text-slate-400 font-semibold block mt-1">
              Per Proactive AI Fix
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 pt-4">
          <h3 className="text-2xl font-bold text-slate-950">
            Ready to Inspect Infrastructure?
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/report"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-blue-500/10 hover:opacity-95 transition-all"
            >
              Log a Structural Defect
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm transition-all"
            >
              Explore GIS Hazard Map
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}