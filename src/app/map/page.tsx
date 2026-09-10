"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { Filter, Search, Loader2, RefreshCw, Clock, CheckCircle2, Wrench } from "lucide-react";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
      <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Loading Map...</span>
    </div>
  ),
});

export default function MapPage() {
  const { user, role } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role === "official") params.set("role", "official");
      else if (user?.uid) params.set("uid", user.uid);
      else return setLoading(false);

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
    // ✅ FIX: Removed setInterval to stop flashing!
  }, [user?.uid, role]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] text-slate-800 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {role === "official" ? "City Issue Map" : "My Reports"}
        </h1>
        <button onClick={fetchIssues} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold">
          <RefreshCw className="h-4 w-4" /> Refresh Map
        </button>
      </div>

      <div className="flex-1 w-full p-4 sm:p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-2 shadow-md h-[75vh] w-full relative overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>
          ) : (
            <LiveMap issues={issues} />
          )}
        </div>
      </div>
    </div>
  );
}