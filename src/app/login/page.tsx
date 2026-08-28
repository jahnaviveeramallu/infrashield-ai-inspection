"use client";

import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  User,
  ShieldCheck,
  KeyRound,
  Briefcase,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mockLogin, user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  // Auto-redirect after login
  useEffect(() => {
    if (!authLoading && user) {
      if (role === "official") {
        router.push("/dashboard");
      } else {
        router.push("/report");
      }
    }
  }, [user, role, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.warn("Google Sign-In notice:", error.code, error.message);
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMessage("Google Sign-In failed. Please use the Quick Login buttons below.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    if (isSignUp && !name) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        router.push("/report");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.warn("Login Error:", error.code, error.message);
      
      let friendlyMsg = "Login failed. Please check your email and password.";

      if (
        error.code === "auth/invalid-credential" || 
        error.code === "auth/user-not-found" || 
        error.code === "auth/wrong-password"
      ) {
        friendlyMsg = "Account not found or wrong password. Click 'Create Account' below or use Quick Login.";
      } else if (error.code === "auth/email-already-in-use") {
        friendlyMsg = "This email is already registered. Please Sign In instead.";
      } else if (error.code === "auth/weak-password") {
        friendlyMsg = "Password must be at least 6 characters long.";
      } else if (error.code === "auth/too-many-requests") {
        friendlyMsg = "Too many failed attempts. Please use Quick Login buttons below.";
      }

      setErrorMessage(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMockTrigger = (targetRole: "citizen" | "official") => {
    if (mockLogin) {
      if (targetRole === "official") {
        mockLogin("officer@infrashield.gov.in", "Municipal Officer", "official");
        router.push("/dashboard");
      } else {
        mockLogin("citizen@infrashield.net", "Active Citizen", "citizen");
        router.push("/report");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-tr from-pink-400/10 to-blue-400/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            InfraShield AI
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Report city issues. Track repairs. Help your community.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h3>
            <p className="text-slate-500 text-xs mt-1 font-semibold">
              {isSignUp
                ? "Sign up to start reporting city and campus issues"
                : "Sign in to continue reporting and tracking issues"}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Login Notice</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-normal">{errorMessage}</p>
              
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                  }}
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Create a new account <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Quick Login for Judges */}
          <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
              Quick Login (For Judges)
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleMockTrigger("citizen")}
                className="py-2.5 px-3 text-xs font-bold text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" /> Citizen View
              </button>
              <button
                type="button"
                onClick={() => handleMockTrigger("official")}
                className="py-2.5 px-3 text-xs font-bold text-indigo-600 bg-white hover:bg-slate-50 border border-indigo-200 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Briefcase className="h-3.5 w-3.5" /> Officer View
              </button>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required={isSignUp}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <p className="text-center text-xs text-slate-500 font-semibold">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
              }}
              className="text-blue-600 font-bold hover:text-blue-500 transition-colors underline underline-offset-4"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 text-center pt-2">
            <span>🇮🇳 Built for Digital India</span>
          </div>

        </div>

      </div>
    </div>
  );
}