"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Camera,
  Map,
  Cpu,
  TrendingDown,
  Activity,
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
  UploadCloud,
  Navigation,
  Loader2,
  XCircle,
  AlertTriangle,
  Trophy,
  MapPin
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full flex items-center justify-center bg-slate-100/50 rounded-2xl border border-slate-200">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  ),
});

export default function Home() {
  const { user, civicScore, refreshScore, role } = useAuth();

  // Functional State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null); // Stores dynamic AI response
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [gamificationToast, setGamificationToast] = useState<{ message: string; points: number } | null>(null);
  const [allIssues, setAllIssues] = useState<any[]>([]);

  // Fetch issues on load to populate the map
  useEffect(() => {
    fetchCommunityFeed();
  }, []);

  const fetchCommunityFeed = async () => {
    try {
      const res = await fetch("/api/issues");
      const data = await res.json();
      if (data.success) {
        setAllIssues(data.data.filter((i: any) => i.status !== "resolved"));
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    }
  };

  const awardPoints = async (points: number) => {
    if (!user) return;
    try {
      await fetch("/api/users/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, points }),
      });
      refreshScore();
    } catch (error) {
      console.error("Failed to award points:", error);
    }
  };

  const triggerGamification = (message: string, points: number) => {
    if (points > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#4f46e5", "#3b82f6", "#ec4899", "#10b981"],
      });
    }
    setGamificationToast({ message, points });
    setTimeout(() => setGamificationToast(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setPreview(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDeletePhoto = () => {
    if (confirm("Are you sure you want to delete this photo?")) {
      setPreview(null);
      setFile(null);
      setResult(null);
      setAddress("");
      setCoordinates(null);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setCoordinates({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setAddress(data?.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        alert("Failed to get location.");
        setIsLocating(false);
      }
    );
  };

  const handleAnalyze = async () => {
    if (!preview || !address) return;
    setIsAnalyzing(true);
    setResult(null); // Clear previous result
    try {
      const uploadRes = await fetch("/api/issues/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: preview }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error("Upload Failed");

      const rawBase64 = preview.replace(/^data:image\/\w+;base64,/, "");
      const finalLat = coordinates?.lat || 28.6139 + (Math.random() - 0.5) * 0.05;
      const finalLng = coordinates?.lng || 77.209 + (Math.random() - 0.5) * 0.05;

      const analyzeRes = await fetch("/api/issues/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.imageUrl,
          base64Image: rawBase64,
          mimeType: file?.type || "image/jpeg",
          location: { lat: finalLat, lng: finalLng, address },
        }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      const issueData = analyzeData.data || analyzeData;
      setResult(issueData); // Set the dynamic DTA to UI

      const priorityScore = issueData.priority?.score || 0;
      if (priorityScore >= 50) {
        await awardPoints(50);
        triggerGamification("Civic Duty Completed!", 50);
      } else {
        triggerGamification("Not a Civic Issue!", 0);
      }

      fetchCommunityFeed(); // Refresh the map with the new pin
    } catch (error: any) {
      alert("Error: " + (error.message || "Unknown error occurred."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white overflow-hidden pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            Autonomous Infrastructure Audit
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
          >
            InfraShield{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
              AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed font-medium"
          >
            Snap a photo of damaged roads or civic assets. Gemini AI validates the issue, scores urgency (0–100), estimates repair cost, and dispatches work orders in under 2 seconds.
          </motion.p>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="border-b border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "< 2s", label: "AI Analysis Speed" },
            { value: "0–100", label: "Priority Score" },
            { value: "₹50+", label: "Savings Per Fix" },
            { value: "6 Agents", label: "AI Collaboration" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {stat.value}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. REPORTING SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" id="report">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
              Report a Civic Issue
            </h2>
            <p className="text-slate-500 text-base">
              Upload evidence to initiate AI diagnostics and earn <span className="font-bold text-indigo-600">+50 Points</span>.
            </p>
          </div>

          {!user && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center text-sm text-indigo-800 font-medium">
              Please <Link href="/login" className="underline font-bold">Login</Link> to submit reports and earn points.
            </div>
          )}

          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.label
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-indigo-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-500 transition-all group"
              >
                <UploadCloud className="w-14 h-14 mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-300" />
                <p className="mb-2 text-base text-slate-500">
                  <span className="font-semibold text-slate-700">Click to upload</span> or drag and drop
                </p>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={!user} />
              </motion.label>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full h-72 rounded-2xl overflow-hidden border border-indigo-200 mb-6 shadow-sm group"
              >
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 pointer-events-none" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <label className="cursor-pointer bg-white/90 text-slate-800 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-md">
                    <UploadCloud className="h-4 w-4" /> Change
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <button onClick={handleDeletePhoto} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-md">
                    <XCircle className="h-4 w-4" /> Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location Input */}
          <div className="mt-8 mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Incident Location</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-800"
                  placeholder="e.g. Connaught Place, New Delhi"
                />
              </div>
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-4 bg-white border border-slate-200 rounded-2xl text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2 font-semibold shadow-sm"
              >
                {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
                <span className="hidden sm:inline">GPS</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={!preview || !address || isAnalyzing || !user}
              className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? (
                <><Loader2 className="animate-spin mr-3 h-5 w-5" /> AI Auditing Image...</>
              ) : (
                <><Zap className="mr-2 h-5 w-5" /> Run AI Diagnostics</>
              )}
            </button>
          )}

          {/* DYNAMIC RESULT CARD */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-8 rounded-3xl flex flex-col items-center text-center border shadow-sm ${
                  (result.priority?.score || 0) >= 50 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                }`}
              >
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 ${
                    (result.priority?.score || 0) >= 50 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {(result.priority?.score || 0) >= 50 ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {(result.priority?.score || 0) >= 50 ? "Valid Report! +50 Pts 🎉" : "Invalid Report — 0 Pts ❌"}
                </h3>

                <p className="text-base text-slate-600 mb-4">
                  AI Urgency Score:{" "}
                  <span className={`font-bold px-3 py-1 rounded-lg border ml-2 ${
                      (result.priority?.score || 0) >= 50 ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {result.priority?.score || 0}/100
                  </span>
                </p>

                <div className="text-sm px-6 py-4 rounded-xl border font-medium bg-white text-slate-700 leading-relaxed mb-4 w-full">
                  "{result.executiveSummary?.summary || result.vision?.probableCause || "No summary available"}"
                </div>

                <div className="flex gap-4">
                  <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border">
                    Dept: {result.recommendation?.department || "Unassigned"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border">
                    Type: {result.vision?.issueType || "N/A"}
                  </span>
                </div>

                <button
                  onClick={() => { setPreview(null); setFile(null); setAddress(""); setResult(null); }}
                  className="mt-8 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Start New Inspection →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. LIVE MAP SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Map className="h-8 w-8 text-indigo-600" /> GIS Hazard Overlay
            </h2>
            <p className="text-slate-500 text-sm mt-2">Real-time geospatial tracking of AI-validated civic anomalies.</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            Live Sync Active
          </div>
        </div>

        <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
          <LiveMap issues={allIssues} />
        </div>
      </section>

      {/* Gamification Toast */}
      <AnimatePresence>
        {gamificationToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`bg-slate-900 border-2 rounded-full py-3 px-6 shadow-2xl flex items-center gap-4 ${
                gamificationToast.points > 0 ? "border-indigo-500" : "border-rose-500"
              }`}
            >
              {gamificationToast.points > 0 ? <Trophy className="h-6 w-6 text-indigo-400 animate-bounce" /> : <AlertTriangle className="h-6 w-6 text-rose-500" />}
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm tracking-widest uppercase">{gamificationToast.message}</span>
                <span className={`font-black text-lg leading-none ${gamificationToast.points > 0 ? "text-indigo-400" : "text-rose-400"}`}>
                  {gamificationToast.points > 0 ? `+${gamificationToast.points} PTS` : "0 PTS"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}