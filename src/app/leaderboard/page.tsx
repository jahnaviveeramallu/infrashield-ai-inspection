"use client";

import { useState, useEffect } from "react";
import { 
  Award, 
  Search, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  Activity, 
  FileSpreadsheet, 
  Star,
  Loader2,
  Users
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const sortedData = data.data.sort((a: any, b: any) => (b.civicScore || 0) - (a.civicScore || 0));
        setInspectors(sortedData);
      } else {
        setInspectors([]);
      }
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
      setInspectors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const filteredInspectors = inspectors.filter((ins) => 
    (ins.displayName || ins.email || "User").toLowerCase().includes(searchQuery.toLowerCase()) ||
    getUserLevel(ins.civicScore || 0).toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getUserLevel(score: number): string {
    if (score >= 1000) return "City Guardian 🏆";
    if (score >= 500) return "Active Contributor ⭐";
    if (score >= 150) return "Regular Reporter 🌟";
    return "New Citizen 🌱";
  }

  function getUserBadgeClass(score: number): string {
    if (score >= 1000) return "bg-rose-50 text-rose-700 border-rose-100";
    if (score >= 500) return "bg-amber-50 text-amber-700 border-amber-100";
    if (score >= 150) return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-slate-50 text-slate-500 border-slate-200";
  }

  const podiumInspectors = filteredInspectors.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Header Block */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Community Leaderboard
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Active Citizens
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              See the top active citizens helping report and fix city issues!
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Community Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 font-mono">
                {inspectors.length > 0 ? "98.4%" : "0.0%"}
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Accuracy</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 font-mono">
                {inspectors.length}
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 font-mono">100%</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Reports</span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {podiumInspectors.length > 0 && searchQuery === "" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              Top 3 Leaders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* Rank 2 */}
              {podiumInspectors[1] && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 md:order-1 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="space-y-3">
                    <div className="h-14 w-14 bg-slate-50 rounded-full border-2 border-slate-300 flex items-center justify-center mx-auto relative shadow-sm">
                      <span className="absolute -top-1 -right-1 bg-slate-300 text-slate-800 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white">2</span>
                      <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base truncate">{podiumInspectors[1].displayName || podiumInspectors[1].email || "User"}</h4>
                      <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase mt-1 border ${getUserBadgeClass(podiumInspectors[1].civicScore || 0)}`}>
                        {getUserLevel(podiumInspectors[1].civicScore || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold">Total Points:</span>
                    <strong className="text-slate-800">{podiumInspectors[1].civicScore || 0} Pts</strong>
                  </div>
                </div>
              )}

              {/* Rank 1 */}
              {podiumInspectors[0] && (
                <div className="bg-gradient-to-br from-blue-50/40 via-purple-50/40 to-pink-50/40 border-2 border-blue-500 rounded-2xl p-8 text-center space-y-4 md:order-2 md:-translate-y-4 relative overflow-hidden flex flex-col justify-between shadow-md">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-mono text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Star className="h-3 w-3 fill-current" /> #1 Leader
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="h-16 w-16 bg-blue-100 rounded-full border-2 border-blue-400 flex items-center justify-center mx-auto relative shadow-sm">
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white">1</span>
                      <User className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg truncate">{podiumInspectors[0].displayName || podiumInspectors[0].email || "User"}</h4>
                      <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase mt-1 border ${getUserBadgeClass(podiumInspectors[0].civicScore || 0)}`}>
                        {getUserLevel(podiumInspectors[0].civicScore || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100 flex justify-between text-xs font-mono shadow-inner">
                    <span className="text-slate-400 font-bold">Total Points:</span>
                    <strong className="text-blue-600">{podiumInspectors[0].civicScore || 0} Pts</strong>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {podiumInspectors[2] && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 md:order-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="space-y-3">
                    <div className="h-14 w-14 bg-slate-50 rounded-full border-2 border-amber-300 flex items-center justify-center mx-auto relative shadow-sm">
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white">3</span>
                      <User className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base truncate">{podiumInspectors[2].displayName || podiumInspectors[2].email || "User"}</h4>
                      <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase mt-1 border ${getUserBadgeClass(podiumInspectors[2].civicScore || 0)}`}>
                        {getUserLevel(podiumInspectors[2].civicScore || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold">Total Points:</span>
                    <strong className="text-slate-800">{podiumInspectors[2].civicScore || 0} Pts</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Directory Table */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Level</th>
                    <th className="py-4 px-6 text-center">Accuracy</th>
                    <th className="py-4 px-6 text-right w-36">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredInspectors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 font-medium space-y-2">
                        <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-600 text-sm">No Users Registered Yet</p>
                        <p className="text-xs text-slate-400">Sign up and report an issue to earn points and rank first!</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInspectors.map((ins, index) => {
                      const displayRank = index + 1;
                      const isCurrentUser = user?.uid === ins.id;
                      return (
                        <tr 
                          key={ins.id}
                          className={`transition-colors hover:bg-slate-50 ${
                            isCurrentUser ? "bg-blue-50/20 border-l-2 border-l-blue-500" : ""
                          }`}
                        >
                          <td className="py-4 px-6 text-center font-mono font-bold text-slate-400">
                            {displayRank}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                              {ins.displayName || ins.email || "User"}
                              {isCurrentUser && (
                                <span className="text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getUserBadgeClass(ins.civicScore || 0)}`}>
                              {getUserLevel(ins.civicScore || 0)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-emerald-600">
                            98.5%
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-black text-slate-900">
                            {(ins.civicScore || 0).toLocaleString()} PTS
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}