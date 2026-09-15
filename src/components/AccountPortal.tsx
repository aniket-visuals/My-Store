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

  // Multi-step signup states
  const [signupStep, setSignupStep] = useState<"credentials" | "otp" | "name_bio" | "location_social">("credentials");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [setupLocation, setSetupLocation] = useState("");
  const [setupBio, setSetupBio] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  
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

  
  const handleSignupSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter an email address");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const emailExists = await checkEmailExists(email.trim());
      if (emailExists) {
        setErrorMsg("User already exists. Please sign in");
        setIsLoading(false);
        return;
      }

      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      // Send OTP via email API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: email.trim(),
          subject: "Your Account Verification Code",
          body: `Your verification code is: ${otp}\n\nPlease enter this code to complete your signup.`
        }),
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP email");
      }

      setSignupStep("otp");
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to initiate signup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp !== generatedOtp) {
      setErrorMsg("Invalid OTP code. Please try again.");
      return;
    }
    setErrorMsg(null);
    setSignupStep("name_bio");
  };

  const handleNameBioSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const isAvailable = await checkUsernameAvailability(username.trim());
      if (!isAvailable) {
        setErrorMsg("Username is already taken");
        setIsLoading(false);
        return;
      }
      setSignupStep("location_social");
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
      if (discordUsername) localStorage.setItem("profile_discord", discordUsername);
      if (telegramUsername) localStorage.setItem("profile_telegram", telegramUsername);

      const signupEmail = email.trim();
      
      // Since they already verified via OTP, we can consider the email verified, 
      // but Firebase requires verification links. We will just create the user.
      await emailSignUp(signupEmail, password, name, username.trim(), setupBio);

      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        setSuccessMsg(null);
        if (onClose) onClose();
        else navigate(-1);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
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
    <div 
      className="min-h-screen relative overflow-hidden bg-transparent flex flex-col items-center justify-center p-4 md:p-8 font-sans w-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (onClose) onClose();
          else navigate(-1);
        }
      }}
    >

      <motion.div
        initial={{ scale: 0.98, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-5xl bg-white rounded-[28px] shadow-[0_32px_80px_rgba(110,138,181,0.25)] border border-white/80 overflow-hidden z-10 flex flex-col md:flex-row min-h-[600px]"
      >
        {/* LEFT SIDE: MARKETING PANE */}
        <div className="hidden md:flex flex-col relative w-1/2 bg-[#FDFBF9] overflow-hidden p-12 border-r border-black/5 justify-between">
          <div className="z-10 relative">
            <h1 className="text-[4rem] leading-[1.05] font-black tracking-tight text-[#1a1a1a]">
              Good<br/>
              Creators<br/>
              <span className="font-serif italic font-medium text-[#f95a14]">Better Tools.</span>
            </h1>
            <p className="mt-5 text-[17px] text-black/60 font-medium max-w-[280px] leading-snug">
              Sign in and get access to everything you need.
            </p>
          </div>
          
          <div className="relative w-full h-full min-h-[300px] mt-10 flex items-end justify-center">
            <div className="relative w-full h-full flex items-end justify-center pb-4">
              {/* Laptop mock */}
              <div className="relative w-64 h-40 bg-[#333] rounded-t-xl rounded-b-sm shadow-2xl z-20 flex flex-col items-center justify-center transform -rotate-6 translate-x-4">
                 <div className="w-8 h-8 text-[#f95a14] opacity-90 font-black text-2xl rotate-12 flex items-center justify-center">A</div>
                 <div className="absolute bottom-0 w-full h-2 bg-[#1a1a1a] rounded-b-sm"></div>
                 <div className="absolute -bottom-2 w-[105%] h-2 bg-[#e5e5e5] rounded-b-md shadow-lg border-b border-black/10"></div>
              </div>
              
              {/* Coffee Mug/Plant mock */}
              <div className="absolute left-0 bottom-0 z-30 flex flex-col items-center">
                <div className="relative w-16 h-20 translate-y-4">
                  <div className="absolute w-12 h-20 bg-green-600 rounded-t-[100%] rounded-b-[40%] origin-bottom transform -rotate-[25deg] shadow-inner"></div>
                  <div className="absolute w-12 h-24 bg-green-500 rounded-t-[100%] rounded-b-[40%] origin-bottom transform rotate-12 translate-x-4 -translate-y-4 shadow-inner"></div>
                  <div className="absolute w-10 h-16 bg-green-700 rounded-t-[100%] rounded-b-[40%] origin-bottom transform -rotate-[45deg] -translate-x-4 translate-y-4 shadow-inner"></div>
                </div>
                <div className="w-24 h-24 bg-white rounded-lg shadow-xl relative flex flex-col justify-center items-center font-serif italic text-sm text-[#1a1a1a] font-bold leading-tight z-10 border border-black/5">
                   <span>Edit</span>
                   <span>Create</span>
                   <span>Grow</span>
                   <div className="absolute -right-4 top-4 w-6 h-12 border-[5px] border-l-0 border-white rounded-r-xl shadow-sm"></div>
                </div>
              </div>

              {/* Stacked Books mock */}
              <div className="absolute right-0 bottom-4 z-10 flex flex-col-reverse items-end">
                <div className="w-36 h-10 bg-[#f95a14] rounded-sm shadow-md border-b-2 border-[#d84d0b] flex items-center px-4 transform rotate-3 origin-bottom-right">
                  <span className="text-[11px] font-bold text-white tracking-wide">Sound Effects</span>
                </div>
                <div className="w-36 h-9 bg-[#2a2a2a] rounded-sm shadow-md border-b-2 border-[#1a1a1a] flex items-center px-4 transform translate-y-[2px] -rotate-1 origin-bottom-right z-10">
                  <span className="text-[11px] font-bold text-white tracking-wide">Plugins</span>
                </div>
                <div className="w-36 h-9 bg-[#f5f5f5] rounded-sm shadow-md border-b-2 border-black/10 flex items-center px-4 transform translate-y-[4px] -rotate-2 origin-bottom-right z-20">
                  <span className="text-[11px] font-bold text-[#1a1a1a] tracking-wide">Templates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: AUTHENTICATION FLOW OR DATABASE SIGNUPS DISPLAY */}
        <div className="flex-1 w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto relative bg-white">
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
            ) : (
              <div className="space-y-6 w-full max-w-sm mx-auto md:mx-0 md:max-w-md">
                {/* Header Greeting */}
                <div className="flex flex-col items-start justify-center">
                  <h2 className="text-[2rem] font-bold text-[#1a1a1a] font-sans tracking-tight">
                    {activeTab === "signin" ? "Sign In" : "Sign Up"}
                  </h2>
                  <p className="text-base text-black/50 mt-1.5 leading-relaxed font-sans font-medium">
                    {activeTab === "signin" 
                      ? "Access your creator account."
                      : "Create your account"}
                  </p>
                </div>

                {activeTab === "signin" || (activeTab === "signup" && signupStep === "credentials") ? (
                  <>
                    <form 
                      onSubmit={activeTab === "signin" ? handleEmailSignIn : handleSignupSubmitCredentials} 
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm text-brand-dark mb-1.5 font-medium">
                          {activeTab === "signin" ? "Email or Username" : "Email"}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-black/50 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type={activeTab === "signin" ? "text" : "email"}
                            required
                            placeholder={activeTab === "signin" ? "you@company.com or username" : "you@company.com"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-sm text-brand-dark font-medium">
                            Password
                          </label>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-black/50 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-[#f95a14] transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {activeTab === "signin" && (
                        <div className="flex items-center justify-between pt-1 pb-2">
                          <label className="flex items-center space-x-2 text-xs text-black/60 font-medium cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-[#f95a14] focus:ring-[#f95a14] transition-all cursor-pointer" 
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
                            className="text-xs text-[#f95a14] hover:text-[#d84d0b] font-medium transition-colors cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#f95a14] hover:bg-[#d84d0b] active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans text-[15px] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm mt-2 disabled:opacity-70"
                      >
                        <span>{isLoading ? "Validating..." : activeTab === "signin" ? "Sign In" : "Create Account"}</span>
                      </button>
                    </form>

                    {/* GOOGLE SIGN IN DIVIDER */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-black/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-black/40">or continue with</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-white border border-black/10 hover:border-black/20 hover:bg-black/[0.01] text-[#1a1a1a] font-medium text-[15px] py-3 px-4 rounded-xl shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-70"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.12 2.76-2.38 3.6v3h3.84c2.25-2.07 3.53-5.1 3.53-8.7c0-.25-.01-.5-.03-.73z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-3c-1.07.72-2.45 1.16-4.09 1.16c-3.15 0-5.81-2.13-6.76-5.01H1.32v3.1A11.99 11.99 0 0 0 12 24z" />
                          <path fill="#FBBC05" d="M5.24 14.24A7.2 7.2 0 0 1 4.8 12c0-.79.13-1.56.38-2.28V6.62H1.32a11.99 11.99 0 0 0 0 10.76l3.92-3.14z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.32 6.62l3.92 3.14C6.19 6.88 8.85 4.75 12 4.75z" />
                        </svg>
                        <span>Sign in with Google</span>
                      </button>
                    </div>
                  </>
                ) : activeTab === "signup" && signupStep === "otp" ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm text-brand-dark mb-1.5 font-medium">
                        Verification Code (OTP)
                      </label>
                      <p className="text-xs text-black/50 mb-3">
                        We sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
                      </p>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-black/50 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="123456"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all tracking-[0.5em] font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#f95a14] hover:bg-[#d84d0b] active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans text-[15px] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <span>Verify Email</span>
                    </button>
                  </form>
                ) : activeTab === "signup" && signupStep === "name_bio" ? (
                  <form onSubmit={handleNameBioSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-brand-dark mb-1.5 font-medium">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-black/50 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Alex Mercer"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm text-brand-dark font-medium">
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
                          className={`w-full pl-9 pr-4 py-3 rounded-xl border bg-white hover:border-black/20 outline-none text-sm text-brand-dark transition-all ${usernameStatus === "taken" || usernameStatus === "invalid" ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" : usernameStatus === "available" ? "border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20" : "border-black/10 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20"}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-brand-dark mb-1.5 font-medium">
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
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                      className="w-full bg-[#f95a14] hover:bg-[#d84d0b] active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans text-[15px] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-70 mt-2"
                    >
                      <span>Continue</span>
                    </button>
                  </form>
                ) : activeTab === "signup" && signupStep === "location_social" ? (
                  <form onSubmit={handleEmailSignUpFinal} className="space-y-4">
                    <div>
                      <label className="block text-sm text-brand-dark mb-1.5 font-medium">
                        Select Country
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                        <select
                          value={setupLocation}
                          onChange={(e) => setSetupLocation(e.target.value)}
                          required
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all appearance-none"
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
                      <label className="block text-sm text-brand-dark mb-1.5 font-medium">
                        Discord Username (Optional)
                      </label>
                      <div className="relative">
                        <span className="text-black/30 absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold">@</span>
                        <input
                          type="text"
                          placeholder="discorduser"
                          value={discordUsername}
                          onChange={(e) => setDiscordUsername(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-brand-dark mb-1.5 font-medium">
                        Telegram Username (Optional)
                      </label>
                      <div className="relative">
                        <span className="text-black/30 absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold">@</span>
                        <input
                          type="text"
                          placeholder="telegramuser"
                          value={telegramUsername}
                          onChange={(e) => setTelegramUsername(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 rounded-xl border border-black/10 bg-white hover:border-black/20 focus:border-[#f95a14] focus:ring-1 focus:ring-[#f95a14]/20 outline-none text-sm text-brand-dark transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#f95a14] hover:bg-[#d84d0b] active:scale-[0.99] text-white py-3 rounded-xl font-bold font-sans text-[15px] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-70 mt-4"
                    >
                      <span>{isLoading ? "Finalizing..." : "Complete Setup"}</span>
                    </button>
                  </form>
                ) : null}
                {/* Sign in switcher footer */}
                <div className="text-center pt-2">
                  <p className="text-xs text-black/50 font-medium">
                    {activeTab === "signin" ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => {
                        setActiveTab(activeTab === "signin" ? "signup" : "signin");
                        setErrorMsg(null);
                      }}
                      className="text-[#f95a14] hover:underline font-bold transition-all cursor-pointer"
                    >
                      {activeTab === "signin" ? "Sign Up" : "Sign In"}
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
