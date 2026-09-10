"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Camera, MapPin, AlertTriangle, UploadCloud, CheckCircle2, Loader2, X, ArrowRight, Sparkles, Ban, Check } from "lucide-react";
import { DEFECT_CATEGORIES } from "@/constants";

export default function ReportPage() {
  const { user, loading: authLoading, refreshScore } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("road");
  const [address, setAddress] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude; 
        const lng = pos.coords.longitude;
        setCoordinates({ lat, lng });
        setAddress(`GPS Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setIsLocating(false);
      },
      () => { 
        setErrorMessage("Unable to retrieve GPS."); 
        setIsLocating(false); 
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;
    setIsSubmitting(true); 
    setErrorMessage(null); 

    try {
      const analyzeRes = await fetch("/api/issues/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          defectCategory: category,
          mimeType: imageFile?.type || "image/jpeg",
          uid: user?.uid || "",
          location: { address, lat: coordinates?.lat, lng: coordinates?.lng },
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok || !analyzeData.success || analyzeData.data?.pointsAwarded === 0) {
        setErrorMessage(analyzeData.message || "REJECTED: Please upload a clear photo of real infrastructure damage.");
        setIsSubmitting(false);
        return;
      }

      setAnalysisResult(analyzeData.data);
      setSubmittedTicket(analyzeData.data?.id ? `ISSUE-${analyzeData.data.id.substring(0, 6).toUpperCase()}` : `ISSUE-${Math.floor(100000 + Math.random() * 900000)}`);
      
      // Award Points
      await fetch("/api/users/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user?.uid, points: 50 }),
      });
      if (refreshScore) refreshScore();
      
    } catch (err: any) {
      setErrorMessage("REJECTED: Unable to analyze photo.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (submittedTicket && analysisResult) {
    const severityScore = Number(analysisResult?.priority?.score || 0);
    
    // ✅ FIX: Dynamic ETA based on the unique score
    let estimatedETA = "5-7 Days";
    if (severityScore >= 80) estimatedETA = "Immediate (24h)";
    else if (severityScore >= 60) estimatedETA = "48 Hours";
    else if (severityScore >= 40) estimatedETA = "3-4 Days";

    // ✅ FIX: Dynamic Department based on AI
    const departmentName = analysisResult?.recommendation?.department || "Municipal Corporation";

    return (
      <div className="min-h-[85vh] bg-[#f8fafc] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Report Submitted (+50 PTS)
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Thank You for Reporting!</h1>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-mono">TICKET ID</span>
              <span className="font-mono font-bold text-slate-950">{submittedTicket}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-mono">AI URGENCY SCORE</span>
              <span className={`font-bold ${severityScore >= 80 ? 'text-rose-600' : severityScore >= 50 ? 'text-orange-600' : 'text-blue-600'}`}>
                {severityScore} / 100
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-mono">ESTIMATED ETA</span>
              <span className="font-bold text-blue-600">{estimatedETA}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-mono">DEPARTMENT</span>
              <span className="font-bold text-slate-950 text-right w-1/2 truncate">{departmentName}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
              Report Another
            </button>
            <button onClick={() => router.push("/map")} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md">
              View on Map <ArrowRight className="h-4 w-4 inline" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold text-slate-900 text-center">Report an Issue</h1>
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-bold text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            {!imagePreview ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-indigo-300 rounded-2xl p-10 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <UploadCloud className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-800">Click to upload photo</span>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-72 w-full">
                <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                <button type="button" onClick={() => setImagePreview(null)} className="absolute top-4 right-4 bg-rose-600 text-white p-2 rounded-xl"><X className="h-5 w-5" /></button>
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex gap-2">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Type exact address..." className="flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-sm font-semibold" />
            <button type="button" onClick={handleGetLocation} className="px-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-bold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" /> GPS
            </button>
          </div>
          <button type="submit" disabled={isSubmitting || !imagePreview || !address} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50">
            {isSubmitting ? "Analyzing Photo..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </div>
  );
}