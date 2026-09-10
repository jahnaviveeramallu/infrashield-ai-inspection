"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { 
  MapPin, Filter, Layers, Search, Loader2, RefreshCw, 
  AlertCircle, X, FileText, Clock, CheckCircle2, 
  Wrench, CircleDot
} from "lucide-react";
import { DEFECT_CATEGORIES } from "@/constants";
import { generateEngineeringReport } from "@/lib/utils/pdfGenerator";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
      <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Loading Map...</span>
    </div>
  ),
});

// Helper: Get status display info
function getStatusInfo(status: string) {
  const s = (status || "").toUpperCase();
  if (s === "RESOLVED" || s === "COMPLETED") {
    return { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "✅", step: 3 };
  }
  if (s === "IN_PROGRESS") {
    return { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "🔧", step: 2 };
  }
  return { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "⏳", step: 1 };
}

// Helper: Calculate ETA based on severity score
function getETA(score: number): string {
  if (score > 80) return "5 Days";
  if (score > 60) return "3 Days";
  if (score > 40) return "2 Days";
  return "1 Day";
}

// Status Tracker Component (Pending → In Progress → Completed)
function StatusTracker({ status }: { status: string }) {
  const info = getStatusInfo(status);
  const steps = [
    { label: "Pending", icon: "⏳" },
    { label: "In Progress", icon: "🔧" },
    { label: "Completed", icon: "✅" },
  ];

  return (
    <div className="flex items-center justify-between w-full gap-1 py-2">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum <= info.step;
        const isCurrent = stepNum === info.step;
        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                isActive
                  ? isCurrent
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 scale-110"
                    : "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-slate-100 border-slate-200 text-slate-400"
              }`}>
                {step.icon}
              </div>
              <span className={`text-[9px] font-bold mt-1 ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded ${stepNum < info.step ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MapPage() {
  const { user, role } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // ✅ IF OFFICER: Fetch all issues
      // ✅ IF CITIZEN: Fetch only their own issues using UID
      if (role === "official") {
        params.set("role", "official");
      } else if (user?.uid) {
        params.set("uid", user.uid);
      } else {
        setIssues([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/issues?${params.toString()}`);
      const data = await res.json();
      if (data.success) setIssues(data.data || []);
    } catch (err) {
      console.error("Failed to load map points:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, [user?.uid, role]);

  const filteredIssues = issues.filter((issue) => {
    const severity = (issue.vision?.severity || "").toUpperCase();
    const status = (issue.status || "").toUpperCase();
    const matchesSeverity = severityFilter === "ALL" || severity === severityFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && status !== "IN_PROGRESS" && status !== "RESOLVED" && status !== "COMPLETED") ||
      (statusFilter === "IN_PROGRESS" && status === "IN_PROGRESS") ||
      (statusFilter === "COMPLETED" && (status === "RESOLVED" || status === "COMPLETED"));
    const matchesCategory =
      categoryFilter === "ALL" ||
      (issue.vision?.issueType || "").toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesSearch =
      searchQuery === "" ||
      (issue.location?.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.executiveSummary?.summary || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesCategory && matchesSearch;
  });

  const pendingCount = issues.filter((i) => {
    const s = (i.status || "").toUpperCase();
    return s !== "IN_PROGRESS" && s !== "RESOLVED" && s !== "COMPLETED";
  }).length;
  const inProgressCount = issues.filter((i) => (i.status || "").toUpperCase() === "IN_PROGRESS").length;
  const completedCount = issues.filter((i) => {
    const s = (i.status || "").toUpperCase();
    return s === "RESOLVED" || s === "COMPLETED";
  }).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] text-slate-800 flex flex-col">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              {role === "official" ? "Live City Map • Real-Time Updates" : "My Reported Issues • Live Tracker"}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {role === "official" ? "City Issue Map" : "My Reports"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
              <Clock className="h-3.5 w-3.5" /> Pending: <strong>{pendingCount}</strong>
            </div>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
              <Wrench className="h-3.5 w-3.5" /> In Progress: <strong>{inProgressCount}</strong>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed: <strong>{completedCount}</strong>
            </div>
            <button onClick={fetchIssues} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Filter className="h-4 w-4 text-blue-500" /> Filters
              </div>
              <button onClick={() => { setSeverityFilter("ALL"); setStatusFilter("ALL"); setCategoryFilter("ALL"); setSearchQuery(""); }} className="text-[10px] font-bold text-slate-500 hover:text-blue-600 underline">
                Reset All
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by street or issue..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { key: "ALL", label: "All" },
                  { key: "PENDING", label: "Pending" },
                  { key: "IN_PROGRESS", label: "Active" },
                  { key: "COMPLETED", label: "Done" },
                ].map((s) => (
                  <button key={s.key} onClick={() => setStatusFilter(s.key)} className={`py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${statusFilter === s.key ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Urgency</label>
              <div className="grid grid-cols-5 gap-1">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                  <button key={level} onClick={() => setSeverityFilter(level)} className={`py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${severityFilter === level ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"}`}>
                    {level === "ALL" ? "All" : level === "CRITICAL" ? "Crit" : level === "MEDIUM" ? "Med" : level.charAt(0) + level.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => setCategoryFilter("ALL")} className={`py-1.5 px-3 text-xs font-bold rounded-lg text-left transition-all ${categoryFilter === "ALL" ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700" : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500"}`}>
                  🌐 All
                </button>
                {Object.entries(DEFECT_CATEGORIES).map(([key, item]) => (
                  <button key={key} onClick={() => setCategoryFilter(key)} className={`py-1.5 px-3 text-xs font-bold rounded-lg text-left border truncate transition-all ${categoryFilter === key ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500"}`}>
                    {item.icon} {item.label.split("/")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Issue List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col min-h-[380px]">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between font-bold">
              <span className="uppercase tracking-wider">Issues ({filteredIssues.length})</span>
              <span className="text-[10px] font-normal text-slate-400">Click to view status</span>
            </div>

            <div className="overflow-y-auto max-h-[420px] space-y-2 pr-1 custom-scrollbar">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
              ) : filteredIssues.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                  {role === "official" ? "No issues match your filters." : "You haven't reported any issues yet."}
                </div>
              ) : (
                filteredIssues.map((issue) => {
                  const severity = (issue.vision?.severity || "MEDIUM").toUpperCase();
                  const statusInfo = getStatusInfo(issue.status);
                  const score = issue.priority?.score || 50;
                  return (
                    <div key={issue.id} onClick={() => setSelectedIssue(issue)} className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedIssue?.id === issue.id ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-inner" : "bg-slate-50/50 border-slate-200/60 hover:border-blue-200 hover:bg-white hover:shadow-sm"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase border ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold">ETA: {getETA(score)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mb-1">
                        {issue.executiveSummary?.summary || issue.vision?.issueType || "Reported Issue"}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate font-medium">
                        <MapPin className="h-3 w-3 text-blue-400 shrink-0" />
                        <span className="truncate">{issue.location?.address || "Location Recorded"}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          severity === "CRITICAL" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          severity === "HIGH" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>{severity} ({score}/100)</span>
                        <span className="text-[10px] text-slate-400">{new Date(issue.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Map Container */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-md h-[620px] relative overflow-hidden">
            <LiveMap issues={filteredIssues} />
          </div>
        </div>
      </div>

      {/* Issue Details Modal with Status Tracker */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-800 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded">
                  ISSUE ID: {selectedIssue.id.substring(0, 8).toUpperCase()}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded border ${getStatusInfo(selectedIssue.status).color}`}>
                  {getStatusInfo(selectedIssue.status).icon} {getStatusInfo(selectedIssue.status).label}
                </span>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Tracker */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Repair Progress Tracker</h4>
              <StatusTracker status={selectedIssue.status} />
            </div>

            {/* Photo + Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {selectedIssue.imageUrl && (
                <div className="sm:col-span-1 relative h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <Image src={selectedIssue.imageUrl} alt="Issue Photo" fill className="object-cover" />
                </div>
              )}
              <div className={selectedIssue.imageUrl ? "sm:col-span-2 space-y-2" : "sm:col-span-3 space-y-2"}>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedIssue.executiveSummary?.summary || "Reported Issue"}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  {selectedIssue.location?.address || "Location Saved"}
                </p>
                <div className="pt-1 text-xs space-y-1.5 font-medium">
                  <div className="text-slate-600"><strong className="text-slate-500">Cause:</strong> {selectedIssue.vision?.probableCause || "Under review"}</div>
                  <div className="text-slate-600"><strong className="text-slate-500">Department:</strong> {selectedIssue.recommendation?.department || "Public Works Department"}</div>
                  <div className="text-emerald-700 font-bold"><strong className="text-slate-500 font-normal">Est. Cost:</strong> {selectedIssue.recommendation?.estimatedBudgetRange?.replace(/\$/g, "₹") || "₹45,000"}</div>
                </div>
              </div>
            </div>

            {/* ETA Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Maximum Time to Complete</span>
                  <span className="text-lg font-black text-blue-800">{getETA(selectedIssue.priority?.score || 50)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Urgency Score</span>
                <span className="text-lg font-black text-rose-600">{selectedIssue.priority?.score || 50}/100</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedIssue(null)} className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors">
                Close
              </button>
              <button
                onClick={() => {
                  generateEngineeringReport({
                    reportId: `INFRA-${selectedIssue.id.substring(0, 6).toUpperCase()}`,
                    date: new Date(selectedIssue.createdAt || Date.now()).toLocaleDateString("en-IN"),
                    location: selectedIssue.location?.address || "Location Saved",
                    gpsCoordinates: selectedIssue.location ? `${selectedIssue.location.lat.toFixed(4)}° N, ${selectedIssue.location.lng.toFixed(4)}° E` : "16.3067° N, 80.4365° E",
                    defectType: selectedIssue.vision?.issueType || "Reported Issue",
                    severity: selectedIssue.vision?.severity || "medium",
                    severityScore: selectedIssue.priority?.score || 50,
                    description: selectedIssue.executiveSummary?.summary || "Inspection needed.",
                    aiAnalysis: selectedIssue.vision?.probableCause || "Pending evaluation.",
                    estimatedCost: 45000,
                    recommendedAction: selectedIssue.recommendation?.temporarySolution || "Deploy barricades.",
                    department: selectedIssue.recommendation?.department || "Public Works Department",
                    inspectorName: "Municipal Officer",
                  });
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all"
              >
                <FileText className="h-4 w-4" /> Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}