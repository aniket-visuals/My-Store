import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Mail, User, Eye, EyeOff, AlertTriangle, Check, ArrowRight, Shield } from "lucide-react";
import { googleSignIn, emailSignIn, emailSignUp, checkUsernameAvailability } from "../services/authService";
import { Product } from "../types";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: AuthRequiredModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debounced username check for signup
  useEffect(() => {
    if (activeTab === "signup" && username.trim().length >= 3) {
      setUsernameStatus("loading");
      const timer = setTimeout(async () => {
        try {
          const isAvail = await checkUsernameAvailability(username.trim());
          setUsernameStatus(isAvail ? "available" : "taken");
        } catch {
          setUsernameStatus("idle");
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setUsernameStatus("idle");
    }
  }, [username, activeTab]);

  // ESC key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setSuccessMsg("Signed in successfully!");
        setTimeout(() => {
          onSuccess();
        }, 400);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "signin") {
        await emailSignIn(email.trim(), password);
        setSuccessMsg("Signed in successfully!");
        setTimeout(() => {
          onSuccess();
        }, 400);
      } else {
        if (!name.trim()) {
          setErrorMsg("Please provide your full name.");
          setIsLoading(false);
          return;
        }
        if (usernameStatus === "taken") {
          setErrorMsg("Selected username is already taken.");
          setIsLoading(false);
          return;
        }
        await emailSignUp(email.trim(), password, name.trim(), username.trim());
        setSuccessMsg("Account created! You may now sign in.");
        setActiveTab("signin");
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setErrorMsg("Please verify your email address before signing in. Check your inbox.");
      } else {
        setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden z-10 p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-brand-primary/10 to-brand-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner text-brand-primary">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-neutral-900 tracking-tight">
              Sign In or Sign Up to Buy
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Please sign up or log in before completing your order.
            </p>
          </div>

          {/* Product context card if provided */}
          {product && (
            <div className="mb-5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-900 truncate">{product.name}</p>
                <p className="text-[11px] text-brand-primary font-mono font-semibold">
                  ${product.price} USD • Instant Delivery
                </p>
              </div>
              <div className="shrink-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                In Cart
              </div>
            </div>
          )}

          {/* Status alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer hover:border-neutral-400 active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-3 text-neutral-400 font-mono text-[10px]">
                or continue with email
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === "signin"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === "signup"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {activeTab === "signup" && (
              <>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="Aniket Raj"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono">@</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === "available" && <Check className="w-4 h-4 text-emerald-600" />}
                      {usernameStatus === "taken" && <X className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-brand-primary hover:bg-brand-accent text-white font-semibold py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-mono transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{activeTab === "signin" ? "Sign In & Buy Now" : "Create Account & Buy Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer security badge */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Authentication • Lifetime Access Guarantee</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
