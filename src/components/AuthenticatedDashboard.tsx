import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { checkUsernameAvailability, ensureUserProfile } from "../services/authService";
import { doc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  User,
  
  
  
  
  
  
  
  CheckCircle2,
  Trash2,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Edit3,
  Compass,
  
  
  
  
  Check,
  
  
  Settings,
  LifeBuoy,
  Sun,
  Moon,
  Heart,
  Package
} from "lucide-react";
import UserOrdersSection from "./UserOrdersSection";

const ALL_COUNTRIES = [
  { name: "United States", flag: "🇺🇸", code: "US" },
  { name: "India", flag: "🇮🇳", code: "IN" },
  { name: "United Kingdom", flag: "🇬🇧", code: "GB" },
  { name: "Canada", flag: "🇨🇦", code: "CA" },
  { name: "Australia", flag: "🇦🇺", code: "AU" },
  { name: "Germany", flag: "🇩🇪", code: "DE" },
  { name: "France", flag: "🇫🇷", code: "FR" },
  { name: "Japan", flag: "🇯🇵", code: "JP" },
  { name: "Singapore", flag: "🇸🇬", code: "SG" },
  { name: "United Arab Emirates", flag: "🇦🇪", code: "AE" },
  { name: "Spain", flag: "🇪🇸", code: "ES" },
  { name: "Italy", flag: "🇮🇹", code: "IT" },
  { name: "Brazil", flag: "🇧🇷", code: "BR" },
  { name: "Switzerland", flag: "🇨🇭", code: "CH" },
  { name: "Netherlands", flag: "🇳🇱", code: "NL" },
  { name: "New Zealand", flag: "🇳🇿", code: "NZ" },
  { name: "Mexico", flag: "🇲🇽", code: "MX" },
  { name: "Sweden", flag: "🇸🇪", code: "SE" },
  { name: "Norway", flag: "🇳🇴", code: "NO" },
  { name: "Denmark", flag: "🇩🇰", code: "DK" },
  { name: "Finland", flag: "🇫🇮", code: "FI" },
  { name: "Ireland", flag: "🇮🇪", code: "IE" },
  { name: "South Korea", flag: "🇰🇷", code: "KR" },
  { name: "China", flag: "🇨🇳", code: "CN" },
  { name: "Saudi Arabia", flag: "🇸🇦", code: "SA" },
  { name: "Russia", flag: "🇷🇺", code: "RU" },
  { name: "Turkey", flag: "🇹🇷", code: "TR" },
  { name: "Argentina", flag: "🇦🇷", code: "AR" },
  { name: "Colombia", flag: "🇨🇴", code: "CO" },
  { name: "Peru", flag: "🇵🇪", code: "PE" },
  { name: "Egypt", flag: "🇪🇬", code: "EG" },
  { name: "South Africa", flag: "🇿🇦", code: "ZA" },
  { name: "Nigeria", flag: "🇳🇬", code: "NG" },
  { name: "Kenya", flag: "🇰🇪", code: "KE" },
  { name: "Indonesia", flag: "🇮🇩", code: "ID" },
  { name: "Malaysia", flag: "🇲🇾", code: "MY" },
  { name: "Thailand", flag: "🇹🇭", code: "TH" },
  { name: "Vietnam", flag: "🇻🇳", code: "VN" },
  { name: "Philippines", flag: "🇵🇭", code: "PH" },
  { name: "Pakistan", flag: "🇵🇰", code: "PK" },
  { name: "Bangladesh", flag: "🇧🇩", code: "BD" },
  { name: "Ukraine", flag: "🇺🇦", code: "UA" },
  { name: "Poland", flag: "🇵🇱", code: "PL" },
  { name: "Austria", flag: "🇦🇹", code: "AT" },
  { name: "Belgium", flag: "🇧🇪", code: "BE" },
  { name: "Portugal", flag: "🇵🇹", code: "PT" },
  { name: "Greece", flag: "🇬🇷", code: "GR" },
  { name: "Israel", flag: "🇮🇱", code: "IL" },
  { name: "Chile", flag: "🇨🇱", code: "CL" },
  { name: "Czech Republic", flag: "🇨🇿", code: "CZ" },
];

export interface AuthenticatedDashboardProps {
  user: any;
  handleSignout: () => void;
  onClose?: () => void;
  wishlist?: any[];
  toggleWishlist?: (product: any) => void;
}

export const AuthenticatedDashboard: React.FC<AuthenticatedDashboardProps> = ({
  user,
  handleSignout,
  onClose,
  wishlist = [],
  toggleWishlist,
}) => {
  const navigate = useNavigate();

  // Authoritative user profile states initialized from active Firebase User
  const [profileName, setProfileName] = useState(() => user?.displayName || user?.email?.split("@")[0] || "");
  const [profileHandle, setProfileHandle] = useState("");
  const [tempProfileHandle, setTempProfileHandle] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken" | "invalid">("idle");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileBioText, setProfileBioText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [themeColor, setThemeColor] = useState("light");

  // Draft/Temporary values for editing
  const [tempProfileName, setTempProfileName] = useState(profileName);
  const [tempProfileLocation, setTempProfileLocation] = useState(profileLocation);
  const [tempProfileBioText, setTempProfileBioText] = useState(profileBioText);

  // Load authoritative user profile from Firestore strictly keyed by user.uid
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.uid) return;
      try {
        const profile = await ensureUserProfile(user);
        if (isMounted && profile) {
          const resolvedName = profile.displayName || user.displayName || user.email?.split("@")[0] || "Member";
          const resolvedHandle = profile.username || "";
          const resolvedLoc = profile.location || "";
          const resolvedBio = profile.bio || "";
          const resolvedLang = profile.language || "english";
          const resolvedTheme = profile.theme || "light";

          setProfileName(resolvedName);
          setProfileHandle(resolvedHandle);
          setProfileLocation(resolvedLoc);
          setProfileBioText(resolvedBio);
          setSelectedLanguage(resolvedLang);
          setThemeColor(resolvedTheme);

          setTempProfileName(resolvedName);
          setTempProfileHandle(resolvedHandle);
          setTempProfileLocation(resolvedLoc);
          setTempProfileBioText(resolvedBio);
        }
      } catch (err) {
        console.error("Failed to load authoritative profile from Firestore:", err);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Navigation and alerts
  const location = useLocation();
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>(
    (location.state as any)?.tab || "edit-profile",
  );

  useEffect(() => {
    if ((location.state as any)?.tab) {
      setActiveSidebarTab((location.state as any).tab);
    }
  }, [location.state]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Card edit modes
  const [isEditingProfileDetails, setIsEditingProfileDetails] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  useEffect(() => {
    if (isEditingProfileDetails && tempProfileHandle.trim() && tempProfileHandle.trim() !== profileHandle) {
      if (!/^[a-zA-Z0-9_]+$/.test(tempProfileHandle.trim())) {
        setUsernameStatus("invalid");
        return;
      }
      setUsernameStatus("loading");
      const delayFn = setTimeout(async () => {
        try {
          const isAvailable = await checkUsernameAvailability(tempProfileHandle.trim(), user?.uid);
          setUsernameStatus(isAvailable ? "available" : "taken");
        } catch (e) {
          setUsernameStatus("idle");
        }
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setUsernameStatus("idle");
    }
  }, [tempProfileHandle, isEditingProfileDetails, profileHandle, user?.uid]);

  const handleSaveProfileDetails = async () => {
    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      setSuccessMsg("Please choose a valid and available username");
      return;
    }

    if (!user || !user.uid) {
      setSuccessMsg("User session error. Please sign in again.");
      return;
    }
    
    // Save to Firestore strictly under users/{user.uid}
    try {
      const cleanNewHandle = tempProfileHandle.trim().toLowerCase();

      // Clean up any stale/duplicate username documents registered to this UID
      const unameSnap = await getDocs(query(collection(db, "usernames"), where("uid", "==", user.uid)));
      for (const d of unameSnap.docs) {
        if (d.id.toLowerCase() !== cleanNewHandle) {
          await deleteDoc(d.ref).catch(() => {});
        }
      }

      if (cleanNewHandle) {
        await setDoc(doc(db, "usernames", cleanNewHandle), {
          email: user.email || "",
          uid: user.uid,
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      await setDoc(doc(db, "users", user.uid), {
        username: cleanNewHandle,
        displayName: tempProfileName.trim(),
        email: user.email || "",
        bio: tempProfileBioText.trim(),
        location: tempProfileLocation,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to save to firestore", e);
    }

    setProfileName(tempProfileName.trim());
    setProfileHandle(tempProfileHandle.trim().toLowerCase());
    setProfileLocation(tempProfileLocation);
    setProfileBioText(tempProfileBioText.trim());

    window.dispatchEvent(new Event("profileUpdated"));
    setIsEditingProfileDetails(false);
    setSuccessMsg("Profile details updated successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };


  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const sidebarItems = [
    {
      id: "edit-profile",
      label: "Manage Profile",
      icon: User,
      category: "Profile",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
      category: "Profile",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      category: "Profile",
    },
    { id: "settings", label: "Settings", icon: Settings, category: "Settings" },
    { id: "support", label: "Support", icon: LifeBuoy, category: "Support" },
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-transparent flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-brand-primary/20 selection:text-brand-dark text-brand-dark w-full"
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
        className="relative w-full max-w-6xl bg-brand-bg rounded-[28px] shadow-[0_32px_80px_rgba(110,138,181,0.25)] border border-white/80 overflow-hidden z-10 flex flex-col md:flex-row h-[85vh] min-h-[600px]"
      >
        {/* Dynamic Action Success Notification Alert Bar */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-brand-dark text-white font-semibold text-xs px-6 py-3.5 rounded-full shadow-2xl z-50 flex items-center space-x-2.5 border border-brand-dark backdrop-blur-md"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-black/5 h-full justify-between p-6 shrink-0 z-20">
        <div className="space-y-6">
          {/* Header Logo */}
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center space-x-3 pb-4 border-b border-black/5 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0 relative overflow-hidden rounded-lg">
              <img
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png"
                alt="Editors Hub Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-sans font-black text-base text-brand-dark tracking-tight">
              Editors Hub
            </span>
          </button>

          {/* Navigation Sections */}
          <div className="space-y-4">
            {["Profile", "Settings", "Support"].map((category) => (
              <div key={category} className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-black/40 mb-1.5 mt-4 block px-3">
                  {category}
                </span>
                {sidebarItems
                  .filter((item) => item.category === category)
                  .map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeSidebarTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSidebarTab(item.id)}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          isActive
                            ? "bg-brand-primary/10 border border-brand-primary/20/30 text-brand-primary font-bold"
                            : "text-brand-muted hover:text-brand-dark hover:bg-black/[0.02] border border-transparent"
                        }`}
                      >
                        <IconComponent
                          className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-black/40"}`}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="space-y-1.5 pt-4 border-t border-black/5">
          {/* Back home */}
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-black/40 hover:text-brand-dark hover:bg-black/[0.02] transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180 text-black/20" />
            <span>Go Back</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <div className="md:hidden w-full bg-white border-b border-black/5 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-black/60 hover:text-brand-dark hover:bg-black/[0.02] rounded-lg"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center shrink-0 relative overflow-hidden rounded-md">
              <img
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png"
                alt="Editors Hub Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-sans font-black text-sm text-brand-dark tracking-tight">
              Editors Hub
            </span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          {(() => {
            const avatarSrc = user?.photoURL;
            return avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-black/10 cursor-pointer"
              onClick={() => setActiveSidebarTab("edit-profile")}
            />
          ) : (
            <div
              onClick={() => setActiveSidebarTab("edit-profile")}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-[10px] border border-black/10 cursor-pointer select-none"
            >
              {profileName ? profileName.charAt(0).toUpperCase() : "U"}
            </div>
          );})()}
          <button
            onClick={onClose}
            className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-full"
          >
            Back
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white p-6 shadow-2xl z-50 md:hidden flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-black/5">
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 relative overflow-hidden rounded-lg">
                      <img
                        src="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png"
                        alt="Editors Hub Logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-sans font-black text-sm text-brand-dark tracking-tight">
                      Editors Hub
                    </span>
                  </button>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 text-black/40 hover:text-black/60 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="space-y-4">
                  {["Profile", "Settings", "Support"].map((category) => (
                    <div key={category} className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-black text-black/40 mb-1.5 mt-2 block px-2">
                        {category}
                      </span>
                      {sidebarItems
                        .filter((item) => item.category === category)
                        .map((item) => {
                          const IconComponent = item.icon;
                          const isActive = activeSidebarTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveSidebarTab(item.id);
                                setIsMobileSidebarOpen(false);
                              }}
                              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                                isActive
                                  ? "bg-brand-primary/10 border border-brand-primary/20/30 text-brand-primary font-bold"
                                  : "text-brand-muted hover:text-brand-dark hover:bg-black/[0.02] border border-transparent"
                              }`}
                            >
                              <IconComponent
                                className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-black/40"}`}
                              />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-black/5 mt-6">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    navigate(-1);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-brand-dark hover:bg-black/[0.02]"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 text-black/40" />
                  <span>Go Back</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 h-full p-5 sm:p-8 md:p-10 flex flex-col justify-start overflow-y-auto">
        {/* DYNAMIC TAB CONTROLLER */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-start w-full">
          {/* LEFT / CENTER CORE WORKSPACE ELEMENT */}
          <div className="flex-1 w-full space-y-6">
            {/* Active Tab Heading Title */}
            <div className="text-left mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
                {activeSidebarTab === "edit-profile" && "Manage Profile"}
                {activeSidebarTab === "orders" && "My Orders"}
                {activeSidebarTab === "settings" && "Settings"}
                {activeSidebarTab === "support" && "Support"}
                {activeSidebarTab === "wishlist" && "Wishlist"}
              </h1>
              <p className="text-xs text-brand-muted mt-1">
                {activeSidebarTab === "edit-profile" &&
                  "Manage your professional creator identity, contact, bio and location parameters."}
                {activeSidebarTab === "orders" &&
                  "View and track your purchases, licenses, instant downloads, and approval statuses."}
                {activeSidebarTab === "settings" &&
                  "Configure your general preferences and system settings."}
                {activeSidebarTab === "support" &&
                  "Get help and support for your workspace."}
                {activeSidebarTab === "wishlist" &&
                  "View and manage your saved creative assets and bundles."}
              </p>
            </div>

            {/* MANAGE PROFILE TAB CONTENT */}
            {activeSidebarTab === "edit-profile" && (
              <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-8 shadow-sm text-left">
                {/* PART 1: PHOTO / AVATAR ROW */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-black/5">
                  <div className="shrink-0">
                    {(() => {
                    const avatarSrc = user?.photoURL;
                    return avatarSrc ? (
                      <div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-black/[0.02]">
                        <img
                          src={avatarSrc}
                          alt={profileName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-4xl">
                        {profileName ? profileName.charAt(0).toUpperCase() : "U"}
                      </div>
                    );})()}
                  </div>

                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <h3 className="font-bold text-lg text-brand-dark">
                      {profileName}
                    </h3>
                    <p className="text-xs font-semibold text-brand-primary bg-brand-primary/10 border border-brand-primary/20/50 px-3 py-1 rounded-full inline-block">
                      Google Account Connected
                    </p>
                    <p className="text-xs text-black/40 block pt-1">
                      Profile photo is automatically synced with your Google
                      profile.
                    </p>
                  </div>
                </div>

                {/* PART 2: PROFILE DETAILS */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.02]">
                    <h3 className="font-bold text-sm text-brand-dark">
                      Profile Details
                    </h3>
                    {!isEditingProfileDetails ? (
                      <button
                        onClick={() => {
                          setTempProfileName(profileName);
                          setTempProfileHandle(profileHandle);
                          setTempProfileLocation(profileLocation);
                          setTempProfileBioText(profileBioText);
                          setIsEditingProfileDetails(true);
                        }}
                        className="px-3.5 py-1.5 border border-black/10 hover:bg-black/[0.02] text-black/80 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-black/40" />
                        <span>Edit Details</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsEditingProfileDetails(false)}
                          className="px-3 py-1.5 text-xs text-brand-muted hover:text-brand-dark font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfileDetails}
                          className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-accent text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingProfileDetails ? (
                    <div className="space-y-6">
                      {/* Grid for Name, Email, and Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                            Full Name
                          </p>
                          <p className="text-xs font-bold text-brand-dark">
                            {profileName}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                            Username
                          </p>
                          <p className="text-xs font-medium text-black/80 truncate">
                            @{profileHandle}
                          </p>
                        </div>
<div className="space-y-1">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                            Email
                          </p>
                          <p className="text-xs font-medium text-black/80 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                            Location
                          </p>
                          <div className="flex items-center space-x-1 text-brand-dark text-xs font-bold">
                            <Compass className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                            <span>{profileLocation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div className="space-y-2 pt-4 border-t border-black/[0.02]">
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                          Biography
                        </p>
                        <p className="text-xs font-medium text-black/60 leading-relaxed font-sans whitespace-pre-line">
                          {profileBioText}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={tempProfileName}
                          onChange={(e) => setTempProfileName(e.target.value)}
                          className="w-full text-xs font-semibold text-brand-dark bg-black/[0.02] border border-black/10 rounded-xl px-4 py-2.5 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                          placeholder="Your Name"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
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
                            value={tempProfileHandle}
                            onChange={(e) => setTempProfileHandle(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-black/[0.02] hover:bg-black/[0.03] focus:bg-white outline-none text-xs text-brand-dark focus:ring-1 transition-all font-semibold ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : usernameStatus === 'available' ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20' : 'border-black/10 focus:border-brand-primary focus:ring-brand-primary/20'}`}
                            placeholder="username"
                          />
                        </div>
                      </div>

<div className="space-y-2">
                        <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                          Location / Country
                        </label>
                        <div className="relative">
                          <select
                            value={tempProfileLocation}
                            onChange={(e) =>
                              setTempProfileLocation(e.target.value)
                            }
                            className="w-full appearance-none bg-black/[0.02] border border-black/10 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer"
                          >
                            <option value="">None Selected</option>
                            {ALL_COUNTRIES.map((country) => (
                              <option key={country.name} value={country.name}>
                                {country.flag} {country.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-black/40" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                            Biography
                          </label>
                          <span className="text-[10px] font-bold text-black/40">
                            {tempProfileBioText.length}/65
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={tempProfileBioText}
                          onChange={(e) =>
                            setTempProfileBioText(e.target.value)
                          }
                          maxLength={65}
                          className="w-full text-xs font-semibold text-brand-dark bg-black/[0.02] border border-black/10 rounded-xl p-4 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB CONTENT */}
            {activeSidebarTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-6 shadow-sm text-left">
                  <div className="pb-4 border-b border-black/[0.02]">
                    <h3 className="font-bold text-sm text-brand-dark">
                      Preferences
                    </h3>
                    <p className="text-xs text-black/40">
                      Adjust your general settings and preferences here.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Language Selection */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-brand-dark">
                          Language
                        </h4>
                        <p className="text-xs text-black/40">
                          Change the language of the site.
                        </p>
                      </div>
                      <div className="relative">
                        <select
                          value={selectedLanguage}
                          onChange={async (e) => {
                            const val = e.target.value;
                            setSelectedLanguage(val);
                            if (user?.uid) {
                              await setDoc(doc(db, "users", user.uid), { language: val }, { merge: true }).catch(() => {});
                            }
                            const labels: Record<string, string> = {
                              english: "English",
                              spanish: "Español",
                              french: "Français",
                              german: "Deutsch",
                            };
                            triggerSuccess(
                              `Language switched to ${labels[val]}!`,
                            );
                          }}
                          className="w-full appearance-none bg-black/[0.02] border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer"
                        >
                          <option value="english">🇺🇸 English</option>
                          <option value="spanish">🇪🇸 Español</option>
                          <option value="french">🇫🇷 Français</option>
                          <option value="german">🇩🇪 Deutsch</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-black/40" />
                        </div>
                      </div>
                    </div>

                    {/* Appearance Selection */}
                    <div className="space-y-3 pt-6 border-t border-black/[0.02]">
                      <div>
                        <h4 className="text-sm font-bold text-brand-dark">
                          Appearance
                        </h4>
                        <p className="text-xs text-black/40">
                          Change the theme of the site.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: "light",
                            label: "Light Mode",
                            icon: <Sun className="w-5 h-5 text-amber-500" />,
                          },
                          {
                            id: "dark",
                            label: "Dark Mode",
                            icon: <Moon className="w-5 h-5 text-slate-700" />,
                          },
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={async () => {
                              setThemeColor(theme.id);
                              if (user?.uid) {
                                await setDoc(doc(db, "users", user.uid), { theme: theme.id }, { merge: true }).catch(() => {});
                              }
                              triggerSuccess(
                                `Theme changed to ${theme.label}!`,
                              );
                            }}
                            className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${
                              themeColor === theme.id
                                ? "border-brand-primary bg-brand-primary/5 shadow-sm shadow-brand-primary/10"
                                : "border-black/5 hover:border-black/10 hover:bg-black/[0.02]"
                            }`}
                          >
                            <span className="flex-shrink-0">{theme.icon}</span>
                            <span className="text-xs font-bold text-brand-dark flex-1">
                              {theme.label}
                            </span>
                            {themeColor === theme.id && (
                              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl border-2 border-rose-100 p-6 space-y-4 shadow-sm text-left">
                  <div className="pb-4 border-b border-rose-100">
                    <h3 className="font-bold text-sm text-rose-600 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Danger Zone
                    </h3>
                    <p className="text-xs text-rose-500/70 mt-1">
                      Destructive actions that cannot be undone.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowSignOutConfirm(true)}
                      className="flex-1 flex justify-center items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteAccountConfirm(true)}
                      className="flex-1 flex justify-center items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-sm shadow-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT TAB CONTENT */}
            {activeSidebarTab === "support" && (
              <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-black/[0.02]">
                  <h3 className="font-bold text-sm text-brand-dark">
                    Support & Help Center
                  </h3>
                  <p className="text-xs text-black/40">
                    Get assistance with your account and workspace.
                  </p>
                </div>
                <div className="space-y-4">
                  <div 
                    onClick={() => navigate("/contact")}
                    className="flex items-center justify-between p-4 border border-black/5 rounded-xl bg-black/[0.02] hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark">
                        Contact Support
                      </h4>
                      <p className="text-xs text-black/40">
                        Reach out to our team for help.
                      </p>
                    </div>
                    <LifeBuoy className="w-5 h-5 text-black/40" />
                  </div>
                </div>
              </div>
            )}

            {/* WISHLIST TAB CONTENT */}
            {activeSidebarTab === "wishlist" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm text-left">
                  <div className="pb-4 border-b border-black/[0.02] mb-6">
                    <h3 className="font-bold text-sm text-brand-dark">
                      Your Wishlist
                    </h3>
                    <p className="text-xs text-black/40">
                      Items you have saved for later.
                    </p>
                  </div>
                  
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-black/[0.02] text-black/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-brand-dark">No items in your wishlist</p>
                      <p className="text-xs text-black/40 mt-1 mb-4">Explore the store to add creative assets.</p>
                      <button 
                        onClick={() => navigate("/")}
                        className="text-xs bg-brand-primary text-white px-5 py-2 rounded-xl font-bold hover:bg-brand-accent transition-colors"
                      >
                        Explore Store
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-black/5 rounded-xl group hover:border-black/10 transition-colors cursor-pointer" onClick={() => navigate(`/products/${item.slug}`)}>
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black/5">
                            <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-0.5">{item.category.replace("-", " ")}</p>
                            <h4 className="text-sm font-bold text-brand-dark truncate">{item.name}</h4>
                            <p className="text-xs font-bold text-brand-dark mt-1">${item.price}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist?.(item); }}
                            className="p-2 text-black/20 hover:text-red-500 bg-black/[0.02] hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY ORDERS TAB CONTENT */}
            {activeSidebarTab === "orders" && (
              <UserOrdersSection
                user={user}
                onClose={onClose}
                onNavigateToSupport={() => setActiveSidebarTab("support")}
              />
            )}
          </div>
        </div>
      </main>
      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-black/5"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-5">
                <LogOut className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Sign Out</h3>
              <p className="text-sm text-brand-muted mb-8">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-3 bg-black/[0.03] hover:bg-black/[0.05] text-brand-dark font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSignOutConfirm(false);
                    handleSignout();
                  }}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-sm shadow-rose-500/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteAccountConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteAccountConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-black/5"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-5">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Delete Account</h3>
              <p className="text-sm text-brand-muted mb-8">
                Are you absolutely sure you want to delete your account? This will permanently delete all your data and cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteAccountConfirm(false)}
                  className="flex-1 px-4 py-3 bg-black/[0.03] hover:bg-black/[0.05] text-brand-dark font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteAccountConfirm(false);
                    handleSignout();
                  }}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-sm shadow-rose-500/20 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};
