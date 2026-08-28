"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { 
  Camera, MapPin, AlertTriangle, UploadCloud, CheckCircle2, 
  Loader2, X, FileText, ArrowRight, Sparkles, Ban, Check
} from "lucide-react";
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
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPersonalOrSpam, setIsPersonalOrSpam] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileHash = (file: File): string => `${file.name}-${file.size}-${file.lastModified}`;

  const checkAndRegisterFileHash = (file: File): boolean => {
    try {
      const hash = generateFileHash(file);
      const storedHashes = JSON.parse(localStorage.getItem("infrashield_uploaded_hashes") || "[]");
      if (storedHashes.includes(hash)) return false; 
      storedHashes.push(hash);
      localStorage.setItem("infrashield_uploaded_hashes", JSON.stringify(storedHashes.slice(-50)));
      return true;
    } catch {
      return true;
    }
  };

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file only (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size is too large. Please upload an image under 10MB.");
      return;
    }
    const isUnique = checkAndRegisterFileHash(file);
    if (!isUnique) {
      setIsPersonalOrSpam(true);
      setErrorMessage("DUPLICATE DETECTED: You have already uploaded this exact photograph. Request blocked and 0 Points awarded.");
      return;
    }
    setErrorMessage(null);
    setIsPersonalOrSpam(false);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsDragging(false); 
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); 
  };

  const handleRemoveImage = () => {
    setImageFile(null); 
    setImagePreview(null); 
    setIsPersonalOrSpam(false); 
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { 
      setErrorMessage("GPS location is not supported by your browser."); 
      return; 
    }
    setIsLocating(true); 
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude; 
        const lng = pos.coords.longitude;
        setCoordinates({ lat, lng });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name.split(",").slice(0, 4).join(",").trim());
          } else {
            setAddress(`GPS Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch {
          setAddress(`GPS Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally { 
          setIsLocating(false); 
        }
      },
      () => { 
        setErrorMessage("Unable to retrieve GPS. Please enter your location address manually."); 
        setIsLocating(false); 
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) { setErrorMessage("Please upload a photo of the issue."); return; }
    if (!address.trim() && !coordinates) { setErrorMessage("Please click 'Auto-Detect GPS' or type a location address before submitting."); return; }

    setIsSubmitting(true); 
    setErrorMessage(null); 
    setIsPersonalOrSpam(false);

    try {
      const analyzeRes = await fetch("/api/issues/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          userDescription: description,
          defectCategory: category,
          mimeType: imageFile?.type || "image/jpeg",
          uid: user?.uid || "",
          userId: user?.uid || "",
          reporterName: user?.displayName || "Citizen",
          reporterEmail: user?.email || "",
          location: {
            address: address.trim(),
            lat: coordinates?.lat || 16.3067,
            lng: coordinates?.lng || 80.4365,
          },
        }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok || !analyzeData.success) {
        setIsPersonalOrSpam(true);
        setErrorMessage(analyzeData.message || "REJECTED: Please upload a clear photo of real infrastructure damage. 0 Points Awarded.");
        setIsSubmitting(false);
        return;
      }

      try {
        await fetch("/api/users/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user?.uid, points: 50 }),
        });
        if (refreshScore) refreshScore();
      } catch (scoreErr) { 
        console.warn("Score update skipped:", scoreErr); 
      }

      setAnalysisResult(analyzeData.data);
      setSubmittedTicket(analyzeData.data?.id || `ISSUE-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (err: any) {
      setIsPersonalOrSpam(true);
      setErrorMessage("REJECTED: Unable to analyze photo. Please ensure it shows clear infrastructure damage. 0 Points Awarded.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (authLoading || !user) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
      <p className="text-slate-500 font-semibold text-sm animate-pulse">Loading...</p>
    </div>
  );

  if (submittedTicket) {
    const severityScore = analysisResult?.priority?.score || 50;
    const etaDays = severityScore > 80 ? 5 : severityScore > 60 ? 3 : 2;

    return (
      <div className="min-h-[85vh] bg-[#f8fafc] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
              Report Submitted (+50 PTS)
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Thank You for Reporting!</h1>
            <p className="text-slate-500 text-sm font-medium">Your report has been sent to the municipal office.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-mono">TICKET ID</span>
              <span className="font-mono font-bold text-slate-950">{submittedTicket.substring(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-mono">URGENCY SCORE</span>
              <span className="font-bold text-rose-600">{severityScore} / 100</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-mono">MAX TIME TO FIX</span>
              <span className="font-bold text-blue-600">{etaDays} Days (ETA)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-mono">DEPARTMENT</span>
              <span className="font-bold text-slate-950">{analysisResult?.recommendation?.department || "Public Works Department"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={() => { 
                setSubmittedTicket(null); 
                setImageFile(null); 
                setImagePreview(null); 
                setDescription(""); 
                setAddress(""); 
                setCoordinates(null); 
                setAnalysisResult(null); 
              }} 
              className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
            >
              Report Another Issue
            </button>
            <button 
              onClick={() => router.push("/map")} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 transition-colors"
            >
              View My Reports on Map <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-b border-slate-200 pb-6 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900">Report an Issue</h1>
          <p className="text-slate-500 text-sm mt-1">Upload a photo of damaged roads, broken bridges, or drainage problems to notify city officials.</p>
        </div>

        {errorMessage && (
          <div className={`p-5 border rounded-2xl text-xs font-semibold flex items-start gap-4 shadow-sm ${isPersonalOrSpam ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
            <div className="h-10 w-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center shrink-0">
              {isPersonalOrSpam ? <Ban className="h-5 w-5 text-rose-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
            </div>
            <div className="flex-1 space-y-1">
              <span className="block font-bold text-sm text-rose-900">{isPersonalOrSpam ? "Upload Rejected: Invalid Photograph" : "Validation Error"}</span>
              <p className="text-rose-700">{errorMessage}</p>
              {isPersonalOrSpam && (
                <button type="button" onClick={handleRemoveImage} className="mt-2 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors">
                  Clear Photo & Try Again
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-blue-500" /> 1. Upload Photo of the Issue
            </h2>
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()} 
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onDrop={handleDrop} 
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-slate-200 hover:border-blue-500 bg-slate-50/50"}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <UploadCloud className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-800 block">Drag & drop a photo here, or click to browse</span>
                <span className="text-xs text-slate-400 block mt-1">Upload potholes, road cracks, or drainage issues. Personal photos and ID cards are strictly rejected.</span>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-72 w-full">
                <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button type="button" onClick={handleRemoveImage} className="bg-rose-600 text-white p-1.5 rounded-xl shadow-md hover:bg-rose-500 transition-colors">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Location & Category Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-blue-500" /> 2. Location & Category
            </h2>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.entries(DEFECT_CATEGORIES).map(([key, item]) => (
                  <button 
                    key={key} 
                    type="button" 
                    onClick={() => setCategory(key)} 
                    className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold transition-all ${category === key ? "border-blue-500 bg-blue-50/40 text-blue-800" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label.split("/")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Location Address <span className="text-rose-500">(Required)</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Type exact address..." 
                  required 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" 
                />
                <button 
                  type="button" 
                  onClick={handleGetLocation} 
                  disabled={isLocating} 
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  {isLocating ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <MapPin className="h-4 w-4 text-blue-600" />} Auto-Detect GPS
                </button>
              </div>
              {coordinates && (
                <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Location Saved: {address}
                </p>
              )}
            </div>
          </div>

          {/* Optional Description Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-blue-500" /> 3. Description (Optional)
            </h2>
            <textarea 
              rows={3} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Provide additional details..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || !imagePreview || (!address.trim() && !coordinates)} 
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Analyzing Photo...</>
            ) : (
              <><Sparkles className="h-4.5 w-4.5" /> Submit Issue</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}