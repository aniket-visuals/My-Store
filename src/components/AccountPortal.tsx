import { updateMetaTags } from "../utils/seo";
import { useNavigate } from "react-router-dom";
import { User as FirebaseUser } from "firebase/auth";
import { AuthenticatedDashboard } from "./AuthenticatedDashboard";
import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { X, User, Mail, Lock, LogOut, Check, Database, Sparkles, Eye, EyeOff, AlertTriangle, MapPin, FileText} from "lucide-react";
import { checkUsernameAvailability, checkEmailExists, googleSignIn, emailSignIn, emailSignUp, logout, initAuth, sendForgotPasswordEmail } from "../services/authService";


interface AccountPortalProps {
  onClose?: () => void;
  onLoginStateChange?: (isLoggedIn: boolean, email: string) => void;
  wishlist?: any[];
  toggleWishlist?: (product: any) => void;
}

export default function AccountPortal({
  onClose,
  onLoginStateChange,
  wishlist = [],
  toggleWishlist
}: AccountPortalProps) {
  
  React.useEffect(() => {
    updateMetaTags({
      title: "Account Portal — Editors Hub Store",
      description: "Manage your Editors Hub Store account, purchases, and settings.",
      url: "https://www.editorshubstore.in/portal"
    });
  }, []);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken" | "invalid">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile setup states
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [setupLocation, setSetupLocation] = useState("");
  const [setupBio, setSetupBio] = useState("");

  
  useEffect(() => {
    if (activeTab === "signup" && username.trim()) {
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        setUsernameStatus("invalid");
        return;
      }
      setUsernameStatus("loading");
      const delayFn = setTimeout(async () => {
        try {
          const isAvailable = await checkUsernameAvailability(username.trim());
          setUsernameStatus(isAvailable ? "available" : "taken");
        } catch (e) {
          setUsernameStatus("idle");
        }
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setUsernameStatus("idle");
    }
  }, [username, activeTab]);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser, token) => {
        setUser(currentUser);
        if (token) {
        } else {
          // Check if we can get token
        }
        
        if (onLoginStateChange) {
          onLoginStateChange(true, currentUser.email || "");
        }
        
        // Load signups list if logged in
        if (currentUser) {
        }
      },
      () => {
        setUser(null);
        if (onLoginStateChange) {
          onLoginStateChange(false, "");
        }
      }
    );
    return () => unsubscribe();
  }, []);


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
        navigate(-1);
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

  
  const handleEmailSignUpStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("Please enter a username");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setErrorMsg("Username can only contain letters, numbers, and underscores");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const signupEmail = email.trim() || `${username.trim()}@editorshub.local`;
      const emailExists = await checkEmailExists(signupEmail);
      if (emailExists) {
        setErrorMsg("User already exists. Please sign in");
        setIsLoading(false);
        return;
      }
      
      const isAvailable = await checkUsernameAvailability(username.trim());
      if (!isAvailable) {
        setErrorMsg("Username is already taken");
        setIsLoading(false);
        return;
      }
      setIsSettingUpProfile(true);
    } catch (error) {
      setErrorMsg("Failed to check username availability");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleEmailSignUpFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      localStorage.setItem("profile_location", setupLocation);
      localStorage.setItem("profile_bio_text", setupBio);
      localStorage.setItem("profile_name", name);
      localStorage.setItem("profile_handle", username.trim());
      
      const signupEmail = email.trim() || `${username.trim()}@editorshub.local`;
      
      await emailSignUp(signupEmail, password, name, username.trim(), setupBio);
      
      if (!signupEmail.endsWith("@editorshub.local")) {
        setUnverifiedEmail(signupEmail);
      } else {
        setSuccessMsg("Account created successfully! Please sign in.");
        setTimeout(() => {
          setActiveTab("signin");
          setIsSettingUpProfile(false);
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes("User already exists") || err.message.includes("email-already-in-use"))) {
        setIsSettingUpProfile(false);
      }
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
        setSuccessMsg(`Signed in as ${res.user.displayName}`);
        setTimeout(() => {
          setSuccessMsg(null);
          navigate(-1);
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
    } catch (err: any) {
      setErrorMsg("Failed to sign out.");
    } finally {
      setIsLoading(false);
    }
  };


  if (user && !unverifiedEmail) {
    return (
      <AuthenticatedDashboard
        user={user}
        handleSignout={handleSignout}
        onClose={onClose}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    );
  }


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
                  else navigate(-1);
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
        className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[28px] shadow-[0_32px_80px_rgba(110,138,181,0.25)] border border-white/80 overflow-hidden z-10 flex flex-col min-h-[580px]"
      >
        {/* RIGHT SIDE: AUTHENTICATION FLOW OR DATABASE SIGNUPS DISPLAY */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center overflow-y-auto relative bg-white">
          <button
            onClick={() => {
                  if (onClose) onClose();
                  else navigate(-1);
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
                    <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-red-900">Firebase Console ↗</a></li>
                    <li>Go to <strong>Authentication &gt; Sign-in method</strong></li>
                    <li>Add <strong>Email/Password</strong> and click Enable</li>
                  </ol>
                  <p className="text-red-700/80 pt-1 font-sans">
                    💡 <em>Tip: You can use the standard Google login to access your account instantly!</em>
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
                      {activeTab === "signin" ? "Email or Username" : "Email Address (Optional)"}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={activeTab === "signin" ? "text" : "email"}
                        required={activeTab === "signin"}
                        placeholder={activeTab === "signin" ? "alexmercer@gmail.com or username" : "alexmercer@gmail.com"}
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
            ) : isSettingUpProfile ? (
              <div className="space-y-6">
                {/* Header Icon + Greeting */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black mb-3">
                    <User className="w-5 h-5 text-black animate-pulse" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-black font-sans tracking-tight uppercase">
                    Profile Details
                  </h2>
                  <p className="text-xs text-black/40 mt-2 max-w-xs leading-relaxed font-sans font-medium">
                    Tell us a little bit about yourself to complete your profile.
                  </p>
                </div>

                <form onSubmit={handleEmailSignUpFinal} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                      Select Country
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                      <select
                        value={setupLocation}
                        onChange={(e) => setSetupLocation(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:border-black/35 focus:ring-1 focus:ring-black/5 transition-all font-medium font-sans appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(0,0,0,0.3)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                      >
                        <option value="" disabled>Select your country</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                      Short Bio
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-black/30 absolute left-4 top-4" />
                      <textarea
                        rows={3}
                        maxLength={65}
                        placeholder="Tell us about your work..."
                        value={setupBio}
                        onChange={(e) => setSetupBio(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:border-black/35 focus:ring-1 focus:ring-black/5 transition-all font-medium font-sans resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-black/90 active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md"
                  >
                    <span>{isLoading ? "Creating Account..." : "Complete Sign Up"}</span>
                  </button>
                </form>
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
                  onSubmit={activeTab === "signin" ? handleEmailSignIn : handleEmailSignUpStep1} 
                  className="space-y-4"
                >
                  {activeTab === "signup" && (
                    <>
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
                    
                                        <div className="mt-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest font-bold">
                          Username
                        </label>
                        {usernameStatus === 'loading' && <span className="text-[10px] text-brand-primary font-bold">Checking...</span>}
                        {usernameStatus === 'available' && <span className="text-[10px] text-emerald-500 font-bold">Available!</span>}
                        {usernameStatus === 'taken' && <span className="text-[10px] text-red-500 font-bold">Username taken</span>}
                        {usernameStatus === 'invalid' && <span className="text-[10px] text-red-500 font-bold">Letters, numbers, underscores only</span>}
                      </div>
                      <div className="relative">
                        <span className="text-black/30 absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold">@</span>
                        <input
                          type="text"
                          required
                          placeholder="alexmercer"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:ring-1 transition-all font-medium font-sans ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : usernameStatus === 'available' ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20' : 'border-black/10 focus:border-black/35 focus:ring-black/5'}`}
                        />
                      </div>
                    </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                      {activeTab === "signin" ? "Email or Username" : "Email Address (Optional)"}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={activeTab === "signin" ? "text" : "email"}
                        required={activeTab === "signin"}
                        placeholder={activeTab === "signin" ? "alexmercer@gmail.com or username" : "alexmercer@gmail.com"}
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
                
                <p className="text-[10px] text-center text-black/40 mt-4 font-sans font-medium px-4 leading-relaxed">
                  By continuing, you agree to our <a href="/terms" className="underline hover:text-black">Terms of Service</a> and <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>.
                </p>

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
