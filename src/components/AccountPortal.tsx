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
  SignupRecord
} from "../services/authService";
import { 
  createSpreadsheet, 
  appendSignupRow 
} from "../services/sheetsService";

interface AccountPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginStateChange?: (isLoggedIn: boolean, email: string) => void;
}

export default function AccountPortal({
  isOpen,
  onClose,
  onLoginStateChange
}: AccountPortalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
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
  }, [isOpen]);

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
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
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
      setSuccessMsg("Account created successfully!");
      // Automatically refresh list of signups
      await refreshSignups();
      setTimeout(() => {
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register account.");
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
        }, 2000);
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal box */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-10 flex flex-col md:flex-row my-auto max-h-[90vh]"
          >
            {/* LEFT SIDE: Info Banner or Sheets Controls */}
            <div className="w-full md:w-5/12 bg-black text-white p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto max-h-[35vh] md:max-h-[85vh]">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-brand-primary">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  <span className="text-xs uppercase tracking-widest font-mono font-bold">
                    Sheets Powered Creator
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl leading-tight">
                    {user ? "Sheets Integration Control" : "Unlock High retention Assets"}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    {user 
                      ? "Directly bridge your digital store's signup conversions to any Google Spreadsheet."
                      : "Create your free creator account to track asset downloads, claim licensed items, and export registrations."}
                  </p>
                </div>

                {user && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-white/40">Sheets API Link:</span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-mono font-bold ${
                        accessToken ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {accessToken ? "Authorized" : "Unauthorized"}
                      </span>
                    </div>

                    {!accessToken && (
                      <div className="space-y-3">
                        <p className="text-[11px] text-white/50 leading-relaxed">
                          To connect Google Sheets, authorize access with your Google account.
                        </p>
                        <button
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2.5 px-4 rounded-xl border border-white/10 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 mr-1.5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11.99 11.99 0 0 0 1.32 12c0 1.8.4 3.51 1.1 5l3.42-2.9z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Connect Google Sheets</span>
                        </button>
                      </div>
                    )}

                    {accessToken && (
                      <div className="space-y-3">
                        {spreadsheetId ? (
                          <div className="space-y-2">
                            <div className="bg-black/40 rounded p-2.5 border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Spreadsheet ID</p>
                              <p className="text-[11px] font-mono truncate text-white/80">{spreadsheetId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a 
                                href={spreadsheetUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                              >
                                <span>Open Sheet</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-2">
                            <button
                              onClick={handleCreateNewSheet}
                              disabled={isCreatingSheet}
                              className="w-full bg-brand-primary text-white hover:bg-brand-accent rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>{isCreatingSheet ? "Creating sheet..." : "Create & Link Google Sheet"}</span>
                            </button>
                            <p className="text-[10px] text-white/40 text-center font-sans">
                              Creates "Editors Hub Signups" on your Google Drive
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {user ? (
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {user.displayName || "Registered Creator"}
                      </p>
                      <p className="text-[10px] text-white/40 truncate max-w-[120px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignout}
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-white/30 font-mono text-center">
                  Protected with Firebase Security rules.
                </div>
              )}
            </div>

            {/* RIGHT SIDE: AUTHENTICATION FLOW OR DATABASE SIGNUPS DISPLAY */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-[85vh] relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-black/60 hover:text-black z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status alerts */}
              {errorMsg && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium font-sans space-y-2.5">
                  {errorMsg.includes("auth/operation-not-allowed") || errorMsg.includes("operation-not-allowed") ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-red-800 text-sm">
                        <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                        <span>Email & Password Auth Disabled</span>
                      </div>
                      <p className="text-red-700/90 leading-relaxed font-sans">
                        By default, new Firebase projects only have <strong>Google Login</strong> pre-configured. To enable Email & Password registration, please follow these steps:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 pl-1 text-red-700 font-sans leading-relaxed">
                        <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold hover:text-red-900 transition-colors">Firebase Console ↗</a></li>
                        <li>Select this app's project and navigate to <strong>Build &gt; Authentication</strong></li>
                        <li>Click the <strong>Sign-in method</strong> tab</li>
                        <li>Click <strong>Add new provider</strong>, select <strong>Email/Password</strong>, and click <strong>Enable</strong></li>
                      </ol>
                      <p className="text-red-700/80 pt-1 font-sans">
                        💡 <em>Tip: You can use <strong>Google sheets auto log signup</strong> below to sign up instantly without needing to configure anything!</em>
                      </p>
                    </div>
                  ) : (
                    <p>{errorMsg}</p>
                  )}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-medium font-sans flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* AUTH NOT LOGGED IN MODE */}
              {!user ? (
                <div className="space-y-6">
                  {/* Tabs */}
                  <div className="flex border-b border-black/5 p-1 bg-black/[0.02] rounded-xl">
                    <button
                      onClick={() => {
                        setActiveTab("signin");
                        setErrorMsg(null);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === "signin"
                          ? "bg-white text-black shadow-sm border border-black/5"
                          : "text-black/40 hover:text-black/80"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("signup");
                        setErrorMsg(null);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === "signup"
                          ? "bg-white text-black shadow-sm border border-black/5"
                          : "text-black/40 hover:text-black/80"
                      }`}
                    >
                      Register
                    </button>
                  </div>

                  {/* FORM FIELDS */}
                  <form 
                    onSubmit={activeTab === "signin" ? handleEmailSignIn : handleEmailSignUp} 
                    className="space-y-4"
                  >
                    {activeTab === "signup" && (
                      <div>
                        <label className="block text-[11px] font-mono text-black/50 uppercase tracking-widest mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="Alex Mercer"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-brand-bg outline-none text-sm text-black focus:border-black/30 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-mono text-black/50 uppercase tracking-widest mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="you@creator.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-brand-bg outline-none text-sm text-black focus:border-black/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-black/50 uppercase tracking-widest mb-1.5">
                        Secret Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-3 rounded-xl border border-black/10 bg-brand-bg outline-none text-sm text-black focus:border-black/30 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-brand-primary text-white hover:bg-brand-accent py-3.5 rounded-xl font-bold font-mono uppercase tracking-wider text-xs transition-colors cursor-pointer"
                    >
                      {isLoading ? "Authenticating security..." : activeTab === "signin" ? "Sign In Credentials" : "Create Account File"}
                    </button>
                  </form>

                  {/* GOOGLE SIGN IN DIVIDER */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-black/5"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-black/30 uppercase tracking-widest font-mono">
                      Authorize Workspace Setup
                    </span>
                    <div className="flex-grow border-t border-black/5"></div>
                  </div>

                  {/* Standard Google Sign In Button */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-black/[0.02] active:bg-black/[0.04] border border-black/10 text-black font-semibold text-sm py-3 px-4 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Google sheets auto log signup</span>
                  </button>
                </div>
              ) : (
                /* LOGGED IN MODE: VIEW SIGNUPS FROM FIRESTORE DATABASE */
                <div className="flex-1 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between border-b border-black/5 pb-3">
                      <div>
                        <h4 className="font-display font-bold text-lg text-black">Active Registration DB</h4>
                        <p className="text-xs text-black/50 mt-0.5">
                          Firestore records logged securely from signups
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={refreshSignups}
                          className="p-2 rounded-lg hover:bg-black/5 text-black/60 hover:text-black transition-colors"
                          title="Refresh Database Records"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        {accessToken && spreadsheetId && (
                          <button
                            onClick={handleSyncToSheet}
                            disabled={isSyncing}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>{isSyncing ? "Syncing..." : "Sync All to Google Sheet"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-black/5 rounded-xl max-h-[250px] overflow-y-auto bg-brand-bg">
                      <table className="min-w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/[0.02] border-b border-black/5">
                            <th className="p-3 text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">Name</th>
                            <th className="p-3 text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">Email</th>
                            <th className="p-3 text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">Provider</th>
                            <th className="p-3 text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">Registered Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-xs text-black">
                          {signupsList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-black/40 font-sans">
                                No registration records found in Firebase DB. Try registering some accounts.
                              </td>
                            </tr>
                          ) : (
                            signupsList.map((signup) => (
                              <tr key={signup.id} className="hover:bg-black/[0.01]">
                                <td className="p-3 font-semibold">{signup.name}</td>
                                <td className="p-3 text-black/70">{signup.email}</td>
                                <td className="p-3">
                                  <span className="bg-black/5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                                    {signup.provider}
                                  </span>
                                </td>
                                <td className="p-3 text-black/40 font-mono text-[11px]">{signup.date}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-black/[0.02] border border-black/5 rounded-xl p-4 flex items-start gap-3">
                    <Database className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-black">How the flow operates</p>
                      <p className="text-[11px] text-black/60 leading-relaxed font-sans">
                        Users who register using Email or Google are written instantly to the Firestore cloud database. Once the administrator authorizes Google Sheets access and connects a spreadsheet, all registrations can be exported instantly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
