import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  Check, 
  Database, 
  FileSpreadsheet, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  PlusCircle,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { 
  googleSignIn, 
  emailSignIn, 
  emailSignUp, 
  logout, 
  initAuth, 
  getAccessToken,
  getAllSignupsFromFirestore,
  SignupRecord,
  sendForgotPasswordEmail
} from "../services/authService";
import { 
  createSpreadsheet, 
  appendSignupRow 
} from "../services/sheetsService";

import { useNavigate } from "react-router-dom";

interface AccountPortalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLoginStateChange?: (isLoggedIn: boolean, email: string) => void;
}

export default function AccountPortal({
  isOpen,
  onClose,
  onLoginStateChange
}: AccountPortalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sheets variables
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem("sheets_spreadsheet_id") || "";
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem("sheets_spreadsheet_url") || "";
  });
  const [signupsList, setSignupsList] = useState<SignupRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);

  // Track authentication status
  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setAccessToken(token);
        } else {
          // Check if we can get token
          const currentToken = await getAccessToken();
          if (currentToken) setAccessToken(currentToken);
        }
        
        if (onLoginStateChange) {
          onLoginStateChange(true, currentUser.email || "");
        }
        
        // Load signups list if logged in
        if (currentUser) {
          refreshSignups();
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
        if (onLoginStateChange) {
          onLoginStateChange(false, "");
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const refreshSignups = async () => {
    const list = await getAllSignupsFromFirestore();
    setSignupsList(list);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await emailSignIn(email, password);
      setSuccessMsg("Welcome back!");
      setTimeout(() => {
        setSuccessMsg(null);
        navigate("/");
      }, 1500);
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
      } else {
        setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await emailSignUp(email, password, name);
      setUnverifiedEmail(email);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await sendForgotPasswordEmail(email);
      setSuccessMsg("We have sent you a password reset email. Please check your inbox!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send password reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setAccessToken(res.accessToken);
        setSuccessMsg(`Signed in as ${res.user.displayName}`);
        await refreshSignups();
        setTimeout(() => {
          setSuccessMsg(null);
          navigate("/");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google Sign-In aborted or failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setAccessToken(null);
      setSpreadsheetId("");
      setSpreadsheetUrl("");
      localStorage.removeItem("sheets_spreadsheet_id");
      localStorage.removeItem("sheets_spreadsheet_url");
    } catch (err: any) {
      setErrorMsg("Failed to sign out.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sheets integration actions
  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      setErrorMsg("Please authorize Google Sheets first by clicking Google Sign-In.");
      return;
    }
    setIsCreatingSheet(true);
    setErrorMsg(null);
    try {
      const sheet = await createSpreadsheet(accessToken, "Editors Hub Signups & Registrations");
      setSpreadsheetId(sheet.id);
      setSpreadsheetUrl(sheet.url);
      localStorage.setItem("sheets_spreadsheet_id", sheet.id);
      localStorage.setItem("sheets_spreadsheet_url", sheet.url);
      setSuccessMsg("Google Sheet successfully created and linked!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Could not create spreadsheet. Ensure Sheets API scopes are authorized.");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncToSheet = async () => {
    if (!accessToken) {
      setErrorMsg("Please connect Google Sheets first.");
      return;
    }
    if (!spreadsheetId) {
      setErrorMsg("Please create or link a spreadsheet first.");
      return;
    }

    const confirmed = window.confirm(
      `Sync all ${signupsList.length} user registrations from database to Google Sheet? This will append the selected rows.`
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setErrorMsg(null);
    let successCount = 0;
    try {
      for (const signup of signupsList) {
        await appendSignupRow(accessToken, spreadsheetId, {
          name: signup.name,
          email: signup.email,
          date: signup.date,
          provider: signup.provider,
        });
        successCount++;
      }
      setSuccessMsg(`Successfully appended ${successCount} signups to Google Sheet!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Partial sync completed (${successCount} synced). Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-tr from-[#ffbe90] via-[#fde2cb] to-[#fff8f2] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      {/* Decorative High-End Ambient Blurred Orbs ("Designer Clouds") */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/40 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-white/50 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] bg-white/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[450px] h-[450px] bg-white/40 blur-[120px] rounded-full pointer-events-none" />

      {/* Back button above the card */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between px-2 z-10">
        <button
          onClick={() => {
            if (onClose) onClose();
            else navigate("/");
          }}
          className="inline-flex items-center space-x-2 text-xs font-bold text-black/60 hover:text-black transition-colors"
        >
          <span>← Back to Storefront</span>
        </button>
        <span className="text-xs text-black/40 font-mono tracking-wider font-semibold">Workspace Sync Center</span>
      </div>

      <motion.div
        initial={{ scale: 0.98, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-[28px] shadow-[0_32px_80px_rgba(110,138,181,0.25)] border border-white/80 overflow-hidden z-10 flex flex-col md:flex-row min-h-[580px]"
      >
        {/* LEFT SIDE: Stunning warm-vibrant sunset gradient panel representing high-end workspace */}
        <div className="w-full md:w-[45%] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#ff8155] via-[#ee4e7e] to-[#9931bf] border-b md:border-b-0 md:border-r border-white/10 shrink-0">
          {/* Internal gradient mesh ambient pulses */}
          <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-yellow-300/30 blur-2xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-pink-400/25 blur-3xl animate-pulse" />

          {/* Logo / Brand Header */}
          <div className="flex items-center space-x-2 text-white/95 z-10">
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
            <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold">
              Editors Hub Sync
            </span>
          </div>

          {/* Dynamic Core Information Panel */}
          <div className="space-y-6 my-auto py-10 z-10">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block">
                Workspace Bridge
              </span>
              <h3 className="font-sans font-black text-3xl md:text-4xl leading-tight tracking-tight text-white">
                {user ? "Sheets Manager" : "EXPLORE. LEARN. SYNC."}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed font-sans font-medium">
                {user 
                  ? "Directly bridge your storefront's registration conversions and customer database with Google Sheets instantly."
                  : "Create your free designer account to claim premium resources, browse modern UI templates, and manage data."}
              </p>
            </div>

            {/* Sheets Linkage Status & Configurations (Persistent state when logged in) */}
            {user && (
              <div className="bg-black/25 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/60 tracking-wider">Sheets API Link:</span>
                  <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold tracking-wider ${
                    accessToken ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {accessToken ? "Authorized" : "Unauthorized"}
                  </span>
                </div>

                {!accessToken && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      Authorize access to sync all database registrations directly to a live Google Sheet.
                    </p>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs py-2.5 px-4 rounded-xl border border-white/15 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11.99 11.99 0 0 0 1.32 12c0 1.8.4 3.51 1.1 5l3.42-2.9z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Connect Sheets API</span>
                    </button>
                  </div>
                )}

                {accessToken && (
                  <div className="space-y-3">
                    {spreadsheetId ? (
                      <div className="space-y-2">
                        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                          <p className="text-[9px] text-white/50 uppercase font-mono tracking-wider">Connected Spreadsheet</p>
                          <p className="text-[11px] font-mono truncate text-white/90 font-medium">{spreadsheetId}</p>
                        </div>
                        <a 
                          href={spreadsheetUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full text-center bg-white text-black hover:bg-white/95 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                        >
                          <span>Open Live Sheet</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={handleCreateNewSheet}
                          disabled={isCreatingSheet}
                          className="w-full bg-white text-black hover:bg-white/90 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-black shrink-0" />
                          <span>{isCreatingSheet ? "Creating sheet..." : "Create Spreadsheet"}</span>
                        </button>
                        <p className="text-[10px] text-white/50 text-center font-sans">
                          Generates a synced signup spreadsheet in your drive
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User profile footer / Branding credit */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between z-10 font-sans">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs uppercase border border-white/15">
                    {user.displayName ? user.displayName.slice(0, 2) : (user.email ? user.email.slice(0, 2) : "CR")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">
                      {user.displayName || "Active Creator"}
                    </p>
                    <p className="text-[10px] text-white/60 truncate max-w-[120px] font-mono">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignout}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white hover:text-red-300 transition-colors border border-white/5 cursor-pointer"
                  title="Sign Out Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-white/50 font-sans tracking-wide">
                Get access to your personal workspace hub.
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: AUTHENTICATION FLOW OR DATABASE SIGNUPS DISPLAY */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center overflow-y-auto relative bg-white">
          <button
            onClick={() => {
              if (onClose) onClose();
              else navigate("/");
            }}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/[0.03] flex items-center justify-center hover:bg-black/5 text-black/40 hover:text-black z-20 transition-all cursor-pointer"
            title="Close portal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Status alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium font-sans space-y-2.5 z-10 shadow-sm">
              {errorMsg.includes("auth/operation-not-allowed") || errorMsg.includes("operation-not-allowed") ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-red-800 text-sm">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                    <span>Email/Password Auth Disabled</span>
                  </div>
                  <p className="text-red-700/90 leading-relaxed font-sans">
                    By default, new Firebase projects only have <strong>Google Login</strong> enabled. To use Email & Password, configure it in your console:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-red-700 font-sans leading-relaxed">
                    <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold hover:text-red-900">Firebase Console ↗</a></li>
                    <li>Go to <strong>Authentication &gt; Sign-in method</strong></li>
                    <li>Add <strong>Email/Password</strong> and click Enable</li>
                  </ol>
                  <p className="text-red-700/80 pt-1 font-sans">
                    💡 <em>Tip: You can use the standard Google Sheets auth below to log in instantly!</em>
                  </p>
                </div>
              ) : (
                <p className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-xs font-semibold flex items-center gap-2 z-10 shadow-sm">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AUTH NOT LOGGED IN MODE */}
          {unverifiedEmail ? (
            <div className="space-y-6 text-center py-6">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black mb-3">
                  <Mail className="w-5 h-5 text-black animate-pulse" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-black font-sans tracking-tight uppercase">
                  Verify Your Email
                </h2>
                <p className="text-xs text-black/60 mt-4 max-w-sm leading-relaxed font-sans font-medium">
                  We have sent you a verification email to <span className="font-bold text-black">{unverifiedEmail}</span>. Please verify it and log in.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUnverifiedEmail(null);
                  setActiveTab("signin");
                  setErrorMsg(null);
                }}
                className="w-full bg-black hover:bg-black/90 active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md"
              >
                <span>Login</span>
              </button>
            </div>
          ) : !user ? (
            activeTab === "forgot" ? (
              <div className="space-y-6">
                {/* Header Icon + Greeting */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black mb-3">
                    <Lock className="w-5 h-5 text-black animate-pulse" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-black font-sans tracking-tight uppercase">
                    RESET PASSWORD
                  </h2>
                  <p className="text-xs text-black/40 mt-2 max-w-xs leading-relaxed font-sans font-medium">
                    Enter your email address and we will send you a secure link to reset your credentials.
                  </p>
                </div>

                {/* Forgot Password Form */}
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="natalia.brak@knmstudio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:border-black/35 focus:ring-1 focus:ring-black/5 transition-all font-medium font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-black/90 active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md"
                  >
                    <span>{isLoading ? "Sending reset link..." : "Send Reset Link"}</span>
                  </button>
                </form>

                {/* Back to Sign In Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-black/50 font-medium">
                    Remember your password?{" "}
                    <button
                      onClick={() => {
                        setActiveTab("signin");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-black hover:underline font-bold transition-all cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Icon + Greeting */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black mb-3">
                    <Sparkles className="w-5 h-5 text-black animate-pulse" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-black font-sans tracking-tight uppercase">
                    {activeTab === "signin" ? "WELCOME BACK" : "CREATE ACCOUNT"}
                  </h2>
                  <p className="text-xs text-black/40 mt-2 max-w-xs leading-relaxed font-sans font-medium">
                    {activeTab === "signin" 
                      ? "Enter your email and password to access your creator account."
                      : "Access your tables, spreadsheets, and developer assets in one place."}
                  </p>
                </div>

                {/* FORM FIELDS */}
                <form 
                  onSubmit={activeTab === "signin" ? handleEmailSignIn : handleEmailSignUp} 
                  className="space-y-4"
                >
                  {activeTab === "signup" && (
                    <div>
                      <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Alex Mercer"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:border-black/35 focus:ring-1 focus:ring-black/5 transition-all font-medium font-sans"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="natalia.brak@knmstudio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:border-black/35 focus:ring-1 focus:ring-black/5 transition-all font-medium font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest font-bold">
                        {activeTab === "signin" ? "Password" : "Create password"}
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:border-black/35 focus:ring-1 focus:ring-black/5 transition-all font-medium font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password Row */}
                  <div className="flex items-center justify-between pt-1 pb-2">
                    <label className="flex items-center space-x-2 text-xs text-black/60 font-semibold cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black transition-all cursor-pointer" 
                      />
                      <span>Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setActiveTab("forgot");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-black/60 hover:text-black font-semibold transition-colors cursor-pointer"
                    >
                      Forgot Password
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-black/90 active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md"
                  >
                    <span>{isLoading ? "Validating security..." : activeTab === "signin" ? "Sign In" : "Create Account"}</span>
                  </button>
                </form>

                {/* GOOGLE SIGN IN DIVIDER */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-black/10"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-black/30 uppercase tracking-widest font-mono font-bold">
                    or continue with
                  </span>
                  <div className="flex-grow border-t border-black/10"></div>
                </div>

                {/* Standard Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-black/[0.02] active:bg-black/[0.04] border border-black/10 text-black font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.12 2.76-2.38 3.6v3h3.84c2.25-2.07 3.53-5.1 3.53-8.7c0-.25-.01-.5-.03-.73z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-3c-1.07.72-2.45 1.16-4.09 1.16c-3.15 0-5.81-2.13-6.76-5.01H1.32v3.1A11.99 11.99 0 0 0 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.24 14.24A7.2 7.2 0 0 1 4.8 12c0-.79.13-1.56.38-2.28V6.62H1.32a11.99 11.99 0 0 0 0 10.76l3.92-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.32 6.62l3.92 3.14C6.19 6.88 8.85 4.75 12 4.75z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                {/* Sign in switcher footer */}
                <div className="text-center pt-2">
                  <p className="text-xs text-black/50 font-medium">
                    {activeTab === "signin" ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => {
                        setActiveTab(activeTab === "signin" ? "signup" : "signin");
                        setErrorMsg(null);
                      }}
                      className="text-black hover:underline font-bold transition-all cursor-pointer"
                    >
                      {activeTab === "signin" ? "Sign up" : "Register"}
                    </button>
                  </p>
                </div>
              </div>
            )
          ) : (
            /* LOGGED IN MODE: CREATOR DASHBOARD */
            <div className="flex-1 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div>
                    <h4 className="font-sans font-black text-xl text-black uppercase tracking-tight">CREATOR DASHBOARD</h4>
                    <p className="text-xs text-black/40 mt-1 font-sans font-medium">
                      Manage your developer credentials, creative kits, and sync active assets.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={handleSignout}
                      className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Welcome Message Card */}
                  <div className="p-4 bg-[#ffbe90]/10 border border-[#ffbe90]/25 rounded-2xl flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#ffbe90]/20 flex items-center justify-center text-[#ee4e7e] shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-black uppercase tracking-wider">Welcome to Editors Hub!</h5>
                      <p className="text-[11px] text-black/60 leading-relaxed mt-1 font-sans">
                        You have successfully authenticated with Firebase. Your personal creator space is online and active. Explore our premium LUTs, template assets, and cinematic sound rises!
                      </p>
                    </div>
                  </div>

                  {/* Active Profile Info */}
                  <div className="p-4 border border-black/10 rounded-2xl space-y-3 bg-black/[0.01]">
                    <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/40">Your Security Credentials</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-black/40 block text-[9px] font-mono uppercase tracking-wider">Account ID</span>
                        <span className="font-mono text-[10px] text-black/80 font-semibold truncate block" title={user.uid}>{user.uid}</span>
                      </div>
                      <div>
                        <span className="text-black/40 block text-[9px] font-mono uppercase tracking-wider">Email Address</span>
                        <span className="font-mono text-[10px] text-black/80 font-semibold truncate block" title={user.email || ""}>{user.email}</span>
                      </div>
                      <div>
                        <span className="text-black/40 block text-[9px] font-mono uppercase tracking-wider">Account Type</span>
                        <span className="font-sans text-[11px] text-emerald-600 font-bold block">Developer Account</span>
                      </div>
                      <div>
                        <span className="text-black/40 block text-[9px] font-mono uppercase tracking-wider">Identity Method</span>
                        <span className="font-sans text-[11px] text-black/80 font-semibold block uppercase">
                          {user.providerData?.[0]?.providerId === "google.com" ? "Google Account" : "Email / Password"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Creative Assets Catalog Status */}
                  <div className="p-4 border border-black/10 rounded-2xl bg-black/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/[0.03] flex items-center justify-center text-black">
                        <Database className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-black uppercase tracking-wider">Marketplace Integration</h5>
                        <p className="text-[10px] text-black/40 mt-0.5">Firestore & Database writes are currently paused.</p>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Auth Only Mode
                    </span>
                  </div>
                </div>
              </div>

              {/* Informative Footer Box explaining DB Sync */}
              <div className="bg-black/[0.02] border border-black/5 rounded-2xl p-4 flex items-start gap-3">
                <Database className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-black">Authentication Shield Status</p>
                  <p className="text-[11px] text-black/60 leading-relaxed font-sans font-medium">
                    Your session is protected by Firebase Authentication. Database integrations are paused while Firestore is in provisioning phase.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
