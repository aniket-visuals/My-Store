import React, { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
  Bell,
  Edit3,
  Instagram,
  Twitter,
  Globe,
  Search,
  Wallet,
  LayoutGrid,
  HelpCircle,
  Phone,
  MapPin,
  Compass,
  FileText,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Calendar,
  CreditCard,
  Landmark,
  Languages,
  Shield,
  Info,
  Menu
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
import { AuthenticatedDashboard } from "./AuthenticatedDashboard";

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

  // Profile custom states for Gridlines UI look
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("profile_name") || "Ronald Richards";
  });
  const [profileHandle, setProfileHandle] = useState(() => {
    return localStorage.getItem("profile_handle") || "RonaldRich@example.com";
  });
  const [bio1, setBio1] = useState(() => {
    return localStorage.getItem("profile_bio1") || "🏝️ Vibe curator @Islands (internet money x communities)";
  });
  const [bio2, setBio2] = useState(() => {
    return localStorage.getItem("profile_bio2") || "🎬 Motion Designer & Video Editor";
  });
  const [bio3, setBio3] = useState(() => {
    return localStorage.getItem("profile_bio3") || "🤫 gen z whisperer";
  });
  const [bio4, setBio4] = useState(() => {
    return localStorage.getItem("profile_bio4") || "🏰 RonaldRich.eth";
  });
  const [linkWallet, setLinkWallet] = useState(() => {
    return localStorage.getItem("profile_link_wallet") || "0x53f1...8472";
  });
  const [linkInstagram, setLinkInstagram] = useState(() => {
    return localStorage.getItem("profile_link_instagram") || "@RonaldRich";
  });
  const [linkTwitter, setLinkTwitter] = useState(() => {
    return localStorage.getItem("profile_link_twitter") || "@RonaldRich";
  });
  const [linkDiscord, setLinkDiscord] = useState(() => {
    return localStorage.getItem("profile_link_discord") || "RonaldRich#1337";
  });
  const [linkSnapchat, setLinkSnapchat] = useState(() => {
    return localStorage.getItem("profile_link_snapchat") || "@RonaldRich";
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem("profile_selected_avatar") || "ronald";
  });

  // Gridlines UI custom states
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>("edit-profile");
  const [profilePhone, setProfilePhone] = useState(() => {
    return localStorage.getItem("profile_phone") || "(219) 555-0114";
  });
  const [profileLocation, setProfileLocation] = useState(() => {
    return localStorage.getItem("profile_location") || "California";
  });
  const [profileBioText, setProfileBioText] = useState(() => {
    return localStorage.getItem("profile_bio_text") || "Hi 👋, I'm Ronald, a passionate UX designer with 10 years of experience in creating intuitive and user-centered digital experiences. With a strong background in user research, information architecture, and interaction design, I am dedicated to crafting seamless digital products that delight users and drive business results.";
  });

  // Sidebar mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Editing states for Cards
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Temporary/Draft values for Inputs
  const [tempProfileName, setTempProfileName] = useState(profileName);
  const [tempProfilePhone, setTempProfilePhone] = useState(profilePhone);
  const [tempProfileLocation, setTempProfileLocation] = useState(profileLocation);
  const [tempProfileBioText, setTempProfileBioText] = useState(profileBioText);

  // Other tabs' state variables
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("profile_language") || "english";
  });
  const [notifyAccountActivity, setNotifyAccountActivity] = useState(true);
  const [notifySheetsSync, setNotifySheetsSync] = useState(true);
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<"gallery" | "activity">("gallery");
  const [isFollowing, setIsFollowing] = useState(false);
  const [bellActive, setBellActive] = useState(false);

  const saveProfileChanges = () => {
    localStorage.setItem("profile_name", profileName);
    localStorage.setItem("profile_handle", profileHandle);
    localStorage.setItem("profile_bio1", bio1);
    localStorage.setItem("profile_bio2", bio2);
    localStorage.setItem("profile_bio3", bio3);
    localStorage.setItem("profile_bio4", bio4);
    localStorage.setItem("profile_link_wallet", linkWallet);
    localStorage.setItem("profile_link_instagram", linkInstagram);
    localStorage.setItem("profile_link_twitter", linkTwitter);
    localStorage.setItem("profile_link_discord", linkDiscord);
    localStorage.setItem("profile_link_snapchat", linkSnapchat);
    localStorage.setItem("profile_selected_avatar", selectedAvatar);
    
    localStorage.setItem("profile_phone", profilePhone);
    localStorage.setItem("profile_location", profileLocation);
    localStorage.setItem("profile_bio_text", profileBioText);
    localStorage.setItem("profile_language", selectedLanguage);
    
    setIsEditingProfile(false);
    setSuccessMsg("Profile settings updated successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

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

  if (user && !unverifiedEmail) {
    return (
      <AuthenticatedDashboard
        user={user}
        accessToken={accessToken}
        spreadsheetId={spreadsheetId}
        spreadsheetUrl={spreadsheetUrl}
        signupsList={signupsList}
        isSyncing={isSyncing}
        isCreatingSheet={isCreatingSheet}
        isLoading={isLoading}
        handleSignout={handleSignout}
        handleGoogleSignIn={handleGoogleSignIn}
        handleCreateNewSheet={handleCreateNewSheet}
        handleSyncToSheet={handleSyncToSheet}
        refreshSignups={refreshSignups}
        onClose={onClose}
        sendForgotPasswordEmail={sendForgotPasswordEmail}
      />
    );
  }

  if (false) {
    return (
      <div className="min-h-screen w-full relative bg-white flex flex-col items-stretch justify-start font-sans">
        {/* Background Decorative Gradient Orbs matching the brand's aesthetics */}
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] bg-rose-200/40 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-[35%] right-[10%] w-[500px] h-[500px] bg-sky-200/30 blur-[120px] rounded-full pointer-events-none" />

        {/* Dynamic Action Success Notification Alert Bar */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 bg-black text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-2xl z-50 flex items-center space-x-2.5 border border-white/10 backdrop-blur-md"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Immersive Creator Profile Card Wrapper - Now Full Screen */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full bg-white z-10 flex flex-col min-h-screen"
        >
          {/* 1. Header Banner exactly styled matching the image gradient */}
          <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-[#f472b6] via-[#c084fc] to-[#f43f5e] overflow-hidden">
            {/* Ambient internal soft pulses */}
            <div className="absolute top-[-50%] left-[-10%] w-[450px] h-[450px] rounded-full bg-yellow-300/20 blur-3xl" />
            <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-400/25 blur-2xl" />

            {/* Responsive aligned header controls */}
            <div className="max-w-6xl mx-auto px-6 sm:px-12 w-full h-full relative">
              {/* Float home trigger back button */}
              <button
                onClick={() => {
                  if (onClose) onClose();
                  else navigate("/");
                }}
                className="absolute top-4 left-6 sm:top-6 sm:left-12 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer z-20 shadow-sm"
              >
                <span>← Back to Storefront</span>
              </button>

              {/* Middle search bar inside the banner exactly matching the image layout */}
              <div className="absolute top-4 right-24 sm:top-6 sm:right-40 flex items-center bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 w-36 sm:w-48 text-xs transition-all text-white z-20 shadow-sm">
                <Search className="w-3.5 h-3.5 text-white/80 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search Islands..."
                  className="bg-transparent text-white placeholder-white/80 text-xs outline-none w-full font-sans font-semibold border-none focus:ring-0 p-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate("/");
                    }
                  }}
                />
              </div>

              {/* Custom user wallet/ens capsule - exactly matching top right user info of image */}
              <div className="absolute top-4 right-6 sm:top-6 sm:right-12 flex items-center space-x-1.5 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-full z-20 shadow-sm select-none">
                <img
                  src={user?.photoURL || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=120"}
                  alt="Profile Mini"
                  className="w-4.5 h-4.5 rounded-full object-cover bg-white/20 border border-white/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="font-mono text-[10px] text-white font-black uppercase tracking-wider">
                  {user?.email ? `${user.email.split("@")[0]}.eth` : "aniket.eth"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Overlapping Profile Avatar Row & Followers stack & CTAs */}
          <div className="max-w-6xl mx-auto w-full px-6 sm:px-12 pb-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between -mt-12 sm:-mt-16 gap-6">
            {/* Circular avatar with gradient border of the image */}
            <div className="relative shrink-0 select-none">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#f472b6] via-[#c084fc] to-[#f43f5e] p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={
                      selectedAvatar === "cat"
                        ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=240"
                        : selectedAvatar === "neon"
                        ? "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=240"
                        : selectedAvatar === "designer"
                        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=240"
                        : selectedAvatar === "pixel"
                        ? "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=240"
                        : user?.photoURL || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=240"
                    }
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover bg-black/[0.02]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              {/* Blue presence verification ring badge exactly matching picture */}
              <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 bg-[#4f46e5] rounded-full border-[3px] border-white flex items-center justify-center text-[10px] text-white font-black shadow-md select-none">
                ✓
              </span>
            </div>

            {/* Followers stack & CTAs matching image exactly */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:pb-3 text-left">
              {/* Overlapping followers stacked row */}
              <div className="flex items-center space-x-2 select-none">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80"
                    alt="Follower 1"
                    className="w-6.5 h-6.5 rounded-full border-2 border-white object-cover shadow-sm shrink-0"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80"
                    alt="Follower 2"
                    className="w-6.5 h-6.5 rounded-full border-2 border-white object-cover shadow-sm shrink-0"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80"
                    alt="Follower 3"
                    className="w-6.5 h-6.5 rounded-full border-2 border-white object-cover shadow-sm shrink-0"
                  />
                </div>
                <span className="text-xs text-black/50 font-sans font-medium">
                  Followed by <span className="text-black font-semibold">@tomz</span>, and 10 others you follow
                </span>
              </div>

              {/* Action capsule layout */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Bell Icon for subscription */}
                <button
                  onClick={() => {
                    setBellActive(!bellActive);
                    if (!bellActive) {
                      alert("Creator notifications turned ON. You'll receive live design assets and updates.");
                    } else {
                      alert("Notifications turned off.");
                    }
                  }}
                  className={`p-2.5 rounded-full border border-black/10 hover:bg-black/[0.03] transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                    bellActive ? "bg-amber-500/10 text-amber-500 border-amber-500/25" : "bg-white text-black/60"
                  }`}
                  title="Subscribe to Notifications"
                >
                  <Bell className="w-4 h-4 fill-current" />
                </button>

                {/* Follow Button */}
                <button
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                    if (!isFollowing) {
                      alert(`You are now following ${profileName}!`);
                    }
                  }}
                  className={`px-6 py-2 rounded-full font-bold text-xs tracking-wide transition-all duration-150 cursor-pointer ${
                    isFollowing
                      ? "bg-black/[0.05] hover:bg-black/10 text-black border border-black/10"
                      : "bg-black hover:bg-black/90 text-white shadow-md active:scale-95"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                {/* Edit details switcher toggle */}
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 rounded-full border border-black/15 hover:bg-black/[0.02] text-black text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? "Close Edit" : "Edit Profile"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Conditional Edit Form Slider */}
          {isEditingProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full border-b border-black/5 bg-black/[0.01]"
            >
              <div className="max-w-6xl mx-auto px-6 sm:px-12 py-6 space-y-4 text-left font-sans">
                <h5 className="text-xs font-bold uppercase tracking-wider text-black">Edit Creator Profile details</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Username Handle</label>
                    <input
                      type="text"
                      value={profileHandle}
                      onChange={(e) => setProfileHandle(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-semibold text-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Bio Line 1 (with emoji)</label>
                    <input
                      type="text"
                      value={bio1}
                      onChange={(e) => setBio1(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Bio Line 2 (with emoji)</label>
                    <input
                      type="text"
                      value={bio2}
                      onChange={(e) => setBio2(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Bio Line 3 (with emoji)</label>
                    <input
                      type="text"
                      value={bio3}
                      onChange={(e) => setBio3(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Bio Line 4 (with emoji)</label>
                    <input
                      type="text"
                      value={bio4}
                      onChange={(e) => setBio4(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">ETH Wallet Address</label>
                    <input
                      type="text"
                      value={linkWallet}
                      onChange={(e) => setLinkWallet(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Instagram Handle</label>
                    <input
                      type="text"
                      value={linkInstagram}
                      onChange={(e) => setLinkInstagram(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs bg-white outline-none focus:border-black/30 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">Choose Avatar Vibe</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { id: "cat", label: "😻 Anime Cat" },
                      { id: "neon", label: "🌆 Synthwave Neon" },
                      { id: "designer", label: "🎨 Vector Designer" },
                      { id: "pixel", label: "🎮 Retro Pixel" },
                      { id: "google", label: "👤 Google Photo" },
                    ].map((avatarOpt) => (
                      <button
                        key={avatarOpt.id}
                        onClick={() => setSelectedAvatar(avatarOpt.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                          selectedAvatar === avatarOpt.id
                            ? "bg-black text-white border-black"
                            : "bg-white text-black/60 border-black/10 hover:border-black/20"
                        }`}
                      >
                        {avatarOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={saveProfileChanges}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="border border-black/15 text-black hover:bg-black/5 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. Profile Text Elements Bio & Details */}
          <div className="max-w-6xl mx-auto w-full px-6 sm:px-12 pb-6 space-y-4 text-left">
            <div>
              <h2 className="text-3xl font-black font-sans text-black tracking-tight leading-tight">
                {profileName}
              </h2>
              <span className="text-[#c84bf0] text-sm font-bold tracking-tight">
                @{profileHandle}
              </span>
            </div>

            {/* Emoji bullet point list exactly matching image style */}
            <div className="space-y-1 text-xs text-black/70 font-medium font-sans max-w-lg leading-relaxed">
              <p>{bio1}</p>
              <p>{bio2}</p>
              <p>{bio3}</p>
              <p>{bio4}</p>
            </div>

            {/* Premium visual social pills exact color structure of the image */}
            <div className="flex flex-wrap gap-2 pt-3 select-none font-sans">
              <div className="bg-black/[0.02] hover:bg-black/[0.04] border border-black/10 text-black text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer">
                <Wallet className="w-3.5 h-3.5 text-black/40 shrink-0" />
                <span>{linkWallet}</span>
              </div>

              <div className="bg-black/[0.02] hover:bg-black/[0.04] border border-black/10 text-black text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer">
                <Instagram className="w-3.5 h-3.5 text-black/40 shrink-0" />
                <span>{linkInstagram}</span>
              </div>

              <div className="bg-black/[0.02] hover:bg-black/[0.04] border border-black/10 text-black text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer">
                <Twitter className="w-3.5 h-3.5 text-black/40 shrink-0" />
                <span>{linkTwitter}</span>
              </div>

              <div className="bg-black/[0.02] hover:bg-black/[0.04] border border-black/10 text-black text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-black/40 shrink-0" />
                <span>{linkDiscord}</span>
              </div>

              <div className="bg-black/[0.02] hover:bg-black/[0.04] border border-black/10 text-black text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-black/40 shrink-0" />
                <span>{linkSnapchat}</span>
              </div>
            </div>
          </div>

          {/* 5. Tabs Navigation layout matching the image "Gallery / Activity" */}
          <div className="w-full border-b border-black/5 bg-white">
            <div className="max-w-6xl mx-auto px-6 sm:px-12 flex items-center space-x-6">
              <button
                onClick={() => setProfileTab("gallery")}
                className={`pb-4 text-xs font-bold uppercase tracking-wider relative transition-colors cursor-pointer ${
                  profileTab === "gallery" ? "text-black border-b-[3px] border-black" : "text-black/40 hover:text-black/70"
                }`}
              >
                <span>Gallery</span>
              </button>
              <button
                onClick={() => setProfileTab("activity")}
                className={`pb-4 text-xs font-bold uppercase tracking-wider relative transition-colors cursor-pointer ${
                  profileTab === "activity" ? "text-black border-b-[3px] border-black" : "text-black/40 hover:text-black/70"
                }`}
              >
                <span>Activity & Workspace</span>
              </button>
            </div>
          </div>

          {/* 6. Tabs dynamic content switcher */}
          {profileTab === "gallery" ? (
            <div className="w-full bg-[#fafbfc] flex-1 py-8 sm:py-12">
              <div className="max-w-6xl mx-auto px-6 sm:px-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
                <div>
                  <h4 className="font-sans font-black text-lg text-black uppercase tracking-tight">Portfolio & Design Assets</h4>
                  <p className="text-xs text-black/40 mt-0.5">Explore unlocked assets, creative bundles, and active workspace downloads.</p>
                </div>
                <button
                  onClick={() => {
                    alert("Creative library successfully refreshed! All connected assets are up to date.");
                  }}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-black border border-black/10 bg-white hover:bg-black/[0.02] px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Library</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Cinematic LUTs Bundle Pro",
                    desc: "Premium color grading profiles calibrated for log profiles. Unlocks perfect cinematic tones instantly.",
                    category: "Color Grading",
                    tag: "PRO",
                    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=320",
                    size: "48 MB"
                  },
                  {
                    title: "Liquid Motion VFX Templates",
                    desc: "Stunning hand-drawn liquid motion graphics. Highly customizable for After Effects & Premiere Pro.",
                    category: "Motion Graphics",
                    tag: "VFX",
                    img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=320",
                    size: "128 MB"
                  },
                  {
                    title: "Hyper-Foley Atmospheric SFX",
                    desc: "High-definition sound design curves, sweeps, riser transitions, and everyday background atmospheres.",
                    category: "Sound Effects",
                    tag: "HQ Audio",
                    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=320",
                    size: "244 MB"
                  },
                  {
                    title: "Cyberpunk Glow Graphics Pack",
                    desc: "Futuristic HUDs, interfaces, holographic rings, and circuit flow assets optimized for quick overlay.",
                    category: "Overlays",
                    tag: "4K",
                    img: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=320",
                    size: "72 MB"
                  },
                  {
                    title: "8K Film Grain & Textures",
                    desc: "Real Kodak 35mm film scans, dust overlays, hair specs, and gate weavers to inject raw textures.",
                    category: "Film Assets",
                    tag: "8K Grain",
                    img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=320",
                    size: "1.2 GB"
                  },
                  {
                    title: "Premium Social Media Frame Kit",
                    desc: "Clean desktop and phone frame layouts to display your video work with aesthetic minimalism.",
                    category: "Templates",
                    tag: "PSD / AE",
                    img: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=320",
                    size: "15 MB"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                    <div>
                      <div className="relative h-40 w-full overflow-hidden bg-black/5">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                          {item.category}
                        </span>
                        <span className="absolute top-3 right-3 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">
                          {item.tag}
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5 text-left">
                        <h5 className="font-bold text-sm text-black group-hover:text-purple-600 transition-colors">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-black/50 leading-relaxed font-sans line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 flex items-center justify-between border-t border-black/5 mt-2">
                      <span className="text-[9px] text-black/40 font-mono font-bold">Size: {item.size}</span>
                      <button
                        onClick={() => {
                          alert(`Starting high-speed download for ${item.title}... Your secure mirror is active.`);
                        }}
                        className="bg-black hover:bg-black/80 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          ) : (
            <div className="w-full bg-[#fafbfc] flex-1 py-8 sm:py-12 space-y-8 text-left">
              <div className="max-w-6xl mx-auto px-6 sm:px-12 space-y-8">
              {/* Database sync counts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sheets Connection Status */}
                <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-mono uppercase tracking-widest text-black/40">Sheets API Link</h5>
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold tracking-wider ${
                        accessToken ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        {accessToken ? "Authorized" : "Unauthorized"}
                      </span>
                    </div>
                    <p className="text-xs text-black/60 leading-relaxed font-sans font-medium">
                      Synchronize all custom user registrants to your Google Sheets automatically.
                    </p>
                  </div>

                  <div className="pt-2">
                    {!accessToken ? (
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-black hover:bg-black/90 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11.99 11.99 0 0 0 1.32 12c0 1.8.4 3.51 1.1 5l3.42-2.9z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Connect Sheets API</span>
                      </button>
                    ) : spreadsheetId ? (
                      <div className="space-y-2">
                        <a 
                          href={spreadsheetUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Open Live Sheet</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={handleCreateNewSheet}
                        disabled={isCreatingSheet}
                        className="w-full bg-black hover:bg-black/90 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-white shrink-0" />
                        <span>{isCreatingSheet ? "Creating sheet..." : "Generate Synced Sheet"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Database sync counts */}
                <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-mono uppercase tracking-widest text-black/40">Database Live Entries</h5>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {signupsList.length} Accounts
                      </span>
                    </div>
                    <p className="text-xs text-black/60 leading-relaxed font-sans font-medium">
                      Pending registrations synced locally from the database to Sheets.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSyncToSheet}
                      disabled={isSyncing || !accessToken || !spreadsheetId}
                      className={`w-full font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 ${
                        !accessToken || !spreadsheetId
                          ? "bg-black/[0.04] text-black/30 border border-black/5 cursor-not-allowed"
                          : "bg-black hover:bg-black/90 text-white shadow-sm cursor-pointer"
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>{isSyncing ? "Syncing to Sheets..." : "Sync Database to Sheets"}</span>
                    </button>
                  </div>
                </div>

                {/* Security Credentials */}
                <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-black/40">Security Credentials</h5>
                    <div className="space-y-1.5 text-[11px] font-sans">
                      <div className="flex justify-between">
                        <span className="text-black/40">UID:</span>
                        <span className="font-mono text-black/70 font-bold truncate max-w-[120px]" title={user.uid}>{user.uid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/40">Account:</span>
                        <span className="text-emerald-600 font-bold">Developer Pro</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/40">Auth Provider:</span>
                        <span className="text-black/70 font-semibold uppercase">{user.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSignout}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center space-x-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Session</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Informative Welcome / Support block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                <div className="p-5 bg-black/[0.02] border border-black/5 rounded-2xl flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-black shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-black uppercase tracking-wider">Welcome to Editors Hub!</h5>
                    <p className="text-[11px] text-black/60 leading-relaxed mt-1">
                      You have successfully authenticated with Firebase. Your personal creator space is online and active. Explore our premium LUTs, template assets, and cinematic sound rises!
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-black/[0.02] border border-black/5 rounded-2xl flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-black shrink-0">
                    <Database className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-black uppercase tracking-wider">Authentication Shield Status</h5>
                    <p className="text-[11px] text-black/60 leading-relaxed mt-1">
                      Your session is protected by Firebase Authentication. Database integrations are active. All sync metrics can be published securely to Google Sheets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signups List Display */}
              <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm text-left">
                <div className="p-5 border-b border-black/5 flex items-center justify-between">
                  <div>
                    <h5 className="font-sans font-black text-sm text-black uppercase tracking-tight">User Registrations Table</h5>
                    <p className="text-[11px] text-black/40">View other creator database registrations that will synchronize with Google Sheets.</p>
                  </div>
                  <button
                    onClick={refreshSignups}
                    className="p-2 rounded-xl border border-black/10 hover:bg-black/[0.02] transition-colors cursor-pointer"
                    title="Refresh Registrants"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-black/60" />
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-black/[0.01] border-b border-black/5 text-black/50 font-mono text-[9px] uppercase tracking-wider font-bold">
                        <th className="py-3 px-5">Name</th>
                        <th className="py-3 px-5">Email Address</th>
                        <th className="py-3 px-5">Date Registered</th>
                        <th className="py-3 px-5">Provider</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {signupsList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-black/30 font-semibold">
                            No registered users in current Firestore collection database.
                          </td>
                        </tr>
                      ) : (
                        signupsList.map((signup, idx) => (
                          <tr key={idx} className="hover:bg-black/[0.005] transition-colors">
                            <td className="py-3 px-5 font-bold text-black">{signup.name}</td>
                            <td className="py-3 px-5 font-mono text-black/70 text-[11px]">{signup.email}</td>
                            <td className="py-3 px-5 text-black/60">{signup.date}</td>
                            <td className="py-3 px-5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                signup.provider === "google.com" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-700"
                              }`}>
                                {signup.provider === "google.com" ? "Google" : "Email"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          )}
        </motion.div>
      </div>
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
