"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3, AlertCircle, CheckCircle2, Clock,
  MapPin, Loader2, RefreshCw, X, Briefcase, Megaphone,
  Activity, Send, Landmark, TrendingDown,
  Download, ShieldCheck, Hammer, History, CheckCircle, Wrench
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { generateEngineeringReport } from "@/lib/utils/pdfGenerator";

const AnalyticsCharts = dynamic(() => import("@/components/AnalyticsCharts"), { ssr: false });

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function getETA(score: number): string {
  if (score > 80) return "5 Days";
  if (score > 60) return "3 Days";
  if (score > 40) return "2 Days";
  return "1 Day";
}

function getStatusInfo(status: string) {
  const s = (status || "").toUpperCase();
  if (s === "RESOLVED" || s === "COMPLETED") return { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "✅" };
  if (s === "IN_PROGRESS") return { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "🔧" };
  return { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "⏳" };
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [workOrders, setWorkOrders] = useState<any[]>([]);

  const fetchData = async (isBackgroundSync = false) => {
    if (!isBackgroundSync) setLoading(true);
    try {
      const [statsRes, issuesRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/issues?role=official"),
      ]);

      if (!statsRes.ok || !issuesRes.ok) {
        throw new Error(`Server returned status: ${statsRes.status} / ${issuesRes.status}`);
      }

      const statsData = await statsRes.json();
      const issuesData = await issuesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (issuesData.success) {
        setIssues(issuesData.data);
        generateDemoWorkOrders(issuesData.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      if (!isBackgroundSync) setLoading(false);
    }
  };

  const generateDemoWorkOrders = (allIssues: any[]) => {
    const orders = allIssues.map((issue, idx) => {
      const severity = (issue.vision?.severity || "medium").toLowerCase();
      const score = issue.priority?.score || 50;
      
      let crewSize = 3; let crewType = "Standard Repair Team"; let budget = 15000; let days = 2; let equipment = ["Basic Tools"];
      if (severity === "critical" || score > 80) { crewSize = 8; crewType = "Emergency Repair Team"; budget = 145000; days = 5; equipment = ["Compactor", "Jackhammer"]; }
      else if (severity === "high" || score > 60) { crewSize = 5; crewType = "Rapid Repair Unit"; budget = 55000; days = 3; equipment = ["Mixer", "Barriers"]; }

      return {
        id: `WO-2026-${1000 + idx}`,
        issueId: issue.id,
        imageUrl: issue.imageUrl,
        locationName: issue.location?.address || "City Location",
        defectType: issue.vision?.issueType || "City Issue",
        severity: severity.toUpperCase(),
        severityScore: score,
        priorityScore: Math.round(score * 1.5),
        createdAt: issue.createdAt || new Date().toISOString(),
        resources: { crewSize, crewType, equipment, totalBudget: budget, estimatedDays: days },
        status: issue.status === "RESOLVED" ? "completed" : issue.status === "IN_PROGRESS" ? "in-progress" : "pending"
      };
    });
    orders.sort((a, b) => b.priorityScore - a.priorityScore);
    setWorkOrders(orders);
  };

  const handleUpdateStatus = async (issueId: string, targetStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    setUpdatingId(issueId);
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        if (targetStatus === "RESOLVED") await fetch(`/api/issues/${issueId}/resolve`, { method: "POST" });
        await fetchData(true);
      }
    } catch (error) { console.error("Status update failed:", error); } 
    finally { setUpdatingId(null); }
  };

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || role !== "official")) router.push("/login");
  }, [user, role, authLoading, router]);

  const handleDownloadPDF = (issue: any) => {
    generateEngineeringReport({
      reportId: `REPORT-${issue.id.substring(0, 6).toUpperCase()}`,
      date: new Date(issue.createdAt || Date.now()).toLocaleDateString("en-IN"),
      location: issue.location?.address || "Location Details Not Logged",
      gpsCoordinates: issue.location ? `${issue.location.lat.toFixed(4)}° N, ${issue.location.lng.toFixed(4)}° E` : "16.3067° N, 80.4365° E",
      defectType: issue.vision?.issueType || "City Issue",
      severity: issue.vision?.severity || "medium",
      severityScore: issue.priority?.score || 50,
      description: issue.executiveSummary?.summary || "Action needed.",
      aiAnalysis: issue.vision?.probableCause || "Pending review.",
      estimatedCost: 45000,
      recommendedAction: "Deploy barricades and repair.",
      department: "Public Works Department",
      imageUrl: issue.imageUrl,
      inspectorName: "Municipal Officer"
    });
  };

  if (loading) return <div className="flex flex-col items-center justify-center w-full h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-6" /><p className="text-blue-600 font-bold tracking-wider uppercase text-xs animate-pulse mt-6">Loading Dashboard...</p></div>;
  if (!user || role !== "official") return null;

  const activeWorkOrders = workOrders.filter(o => o.status !== "completed");
  const completedWorkOrders = workOrders.filter(o => o.status === "completed");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md"><ShieldCheck className="h-5 w-5 text-white" /></div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Municipal Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm font-semibold ml-12">Manage active issues, assign repair teams, and view history</p>
          </div>
          <button onClick={() => fetchData(false)} className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-slate-50 transition-all"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Reports" value={issues.length} icon={<BarChart3 className="h-5 w-5 text-blue-500" />} colorClass="sky" />
          <StatCard title="Pending" value={activeWorkOrders.filter(o => o.status === "pending").length} icon={<Clock className="h-5 w-5 text-amber-500" />} colorClass="amber" />
          <StatCard title="In Progress" value={activeWorkOrders.filter(o => o.status === "in-progress").length} icon={<Wrench className="h-5 w-5 text-blue-500" />} colorClass="sky" />
          <StatCard title="Completed" value={completedWorkOrders.length} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} colorClass="emerald" />
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-2xl max-w-sm border border-slate-200 mt-4">
          <button onClick={() => setActiveTab("queue")} className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === "queue" ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800"}`}><Hammer className="h-4 w-4" /> Active Issues ({activeWorkOrders.length})</button>
          <button onClick={() => setActiveTab("history")} className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === "history" ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800"}`}><History className="h-4 w-4" /> Completed ({completedWorkOrders.length})</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "queue" && (
            <motion.div key="queue-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {activeWorkOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-bold shadow-sm">No active issues! All reported problems are fixed. ✅</div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {activeWorkOrders.map((order) => {
                    const isUpdating = updatingId === order.issueId;
                    return (
                      <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col xl:flex-row gap-6 justify-between relative overflow-hidden">
                        <div className="absolute top-4 right-6 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">Reported {timeAgo(order.createdAt)}</div>
                        <div className="flex-1 space-y-4 pt-4 sm:pt-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded">ID: {order.id.split('-').pop()}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase ${getPriorityColor(order.severity)}`}>{order.severity} ({order.severityScore}/100)</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {order.imageUrl && (<div className="relative h-20 w-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-50"><Image src={order.imageUrl} alt="Issue" fill className="object-cover" /></div>)}
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{order.defectType}</h3>
                              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1"><MapPin className="h-4 w-4 text-blue-400" /> {order.locationName}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3"><span className="text-slate-400 block text-[9px] font-bold uppercase mb-1">👨‍🚒 Repair Team</span><span className="text-slate-800 font-bold text-xs block">{order.resources.crewType} ({order.resources.crewSize} workers)</span></div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3"><span className="text-slate-400 block text-[9px] font-bold uppercase mb-1">💰 Estimated Cost</span><span className="text-emerald-700 font-extrabold text-sm block">₹{order.resources.totalBudget.toLocaleString()}</span></div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3"><span className="text-slate-400 block text-[9px] font-bold uppercase mb-1">⏱️ ETA (Max Time)</span><span className="text-blue-700 font-extrabold text-sm block">{order.resources.estimatedDays} Days</span></div>
                          </div>
                        </div>
                        <div className="flex xl:flex-col items-end justify-between gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Current Status</span>
                            <span className={`block mt-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border text-center ${order.status === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{order.status === "in-progress" ? "🔧 IN PROGRESS" : "⏳ PENDING"}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { const match = issues.find(i => i.id === order.issueId); if (match) setSelectedIssue(match); }} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors">Details</button>
                            {order.status === "pending" ? (
                              <button onClick={() => handleUpdateStatus(order.issueId, 'IN_PROGRESS')} disabled={isUpdating} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50">{isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />} In Progress</button>
                            ) : (
                              <button onClick={() => handleUpdateStatus(order.issueId, 'RESOLVED')} disabled={isUpdating} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50">{isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Mark Complete</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {completedWorkOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-semibold shadow-sm">No completed issues yet. Fixed issues will appear here.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {completedWorkOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
                      <div className="flex gap-4 items-center">
                        {order.imageUrl && (<div className="relative h-14 w-24 rounded-lg overflow-hidden shrink-0 border border-emerald-100 bg-slate-50"><Image src={order.imageUrl} alt="Fixed Defect" fill className="object-cover" /></div>)}
                        <div>
                          <div className="flex items-center gap-2 mb-1"><span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded uppercase">✅ Fixed</span><span className="text-[9px] text-slate-400 font-medium">Reported {timeAgo(order.createdAt)}</span></div>
                          <h4 className="font-bold text-slate-800 text-sm">{order.defectType}</h4>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3 text-emerald-500" /> {order.locationName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 sm:mt-0">
                        <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">Cost: ₹{order.resources.totalBudget.toLocaleString()}</span>
                        <button onClick={() => { const match = issues.find(i => i.id === order.issueId); if (match) handleDownloadPDF(match); }} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Issue Modal */}
        <AnimatePresence>
          {selectedIssue && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-lg w-full relative space-y-4 max-h-[90vh] overflow-y-auto shadow-xl"
              >
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-900 pr-8">
                  {selectedIssue.vision?.issueType || "Issue Details"}
                </h2>
                
                {selectedIssue.imageUrl && (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <Image src={selectedIssue.imageUrl} alt="Issue" fill className="object-cover" />
                  </div>
                )}

                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-blue-500 shrink-0" /> <strong>Location:</strong> {selectedIssue.location?.address || "N/A"}</p>
                  <p><strong>Priority Score:</strong> <span className="text-blue-600 font-bold">{selectedIssue.priority?.score || 0}/100</span></p>
                  <p><strong>Summary:</strong> {selectedIssue.executiveSummary?.summary || "No summary provided."}</p>
                  <p><strong>Cause:</strong> {selectedIssue.vision?.probableCause || "Under analysis."}</p>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                  <button 
                    onClick={() => setSelectedIssue(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(selectedIssue)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Download className="h-4 w-4" /> Export PDF
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, colorClass, isCritical = false }: { title: string; value: number; icon: any; colorClass: string; isCritical?: boolean; }) {
  const glow = colorClass === "sky" ? "bg-blue-50 border-blue-200" : colorClass === "amber" ? "bg-amber-50 border-amber-200" : colorClass === "rose" ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200";
  return (
    <div className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${isCritical ? "border-rose-300 bg-rose-50/20" : "border-slate-200"}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{title}</h3>
        <div className={`p-2 rounded-xl border ${glow}`}>{icon}</div>
      </div>
      <p className="text-3.5xl font-black tracking-tight text-slate-900 font-mono">{value}</p>
    </div>
  );
}

function getPriorityColor(level: string) {
  switch (level.toLowerCase()) {
    case "critical": return "bg-rose-50 text-rose-700 border-rose-200";
    case "high": return "bg-orange-50 text-orange-700 border-orange-200";
    case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-slate-50 text-slate-500 border-slate-200";
  }
}