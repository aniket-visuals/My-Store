import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Languages,
  Bell,
  CreditCard,
  Landmark,
  FileText,
  Lock,
  Shield,
  CheckCircle2,
  Trash2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Edit3,
  Compass,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  FileSpreadsheet,
  Check,
  LayoutGrid,
  Search
} from "lucide-react";

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
  { name: "Czech Republic", flag: "🇨🇿", code: "CZ" }
];

export interface AuthenticatedDashboardProps {
  user: any;
  accessToken: string | null;
  spreadsheetId: string;
  spreadsheetUrl: string;
  signupsList: any[];
  isSyncing: boolean;
  isCreatingSheet: boolean;
  isLoading: boolean;
  handleSignout: () => void;
  handleGoogleSignIn: () => void;
  handleCreateNewSheet: () => void;
  handleSyncToSheet: () => void;
  refreshSignups: () => void;
  onClose?: () => void;
  sendForgotPasswordEmail: (email: string) => Promise<void>;
}

export const AuthenticatedDashboard: React.FC<AuthenticatedDashboardProps> = ({
  user,
  accessToken,
  spreadsheetId,
  spreadsheetUrl,
  signupsList,
  isSyncing,
  isCreatingSheet,
  isLoading,
  handleSignout,
  handleGoogleSignIn,
  handleCreateNewSheet,
  handleSyncToSheet,
  refreshSignups,
  onClose,
  sendForgotPasswordEmail,
}) => {
  // Local profile state variables with localStorage persistence
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("profile_name") || "Ronald Richards";
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    return localStorage.getItem("profile_phone") || "(219) 555-0114";
  });
  const [profileLocation, setProfileLocation] = useState(() => {
    return localStorage.getItem("profile_location") || "California";
  });
  const [profileBioText, setProfileBioText] = useState(() => {
    return (
      localStorage.getItem("profile_bio_text") ||
      "Hi 👋, I'm Ronald, a passionate UX designer with 10 years of experience in creating intuitive and user-centered digital experiences. With a strong background in user research, information architecture, and interaction design, I am dedicated to crafting seamless digital products that delight users and drive business results."
    );
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem("profile_selected_avatar") || "ronald";
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("profile_language") || "english";
  });

  // Navigation and alerts
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>("edit-profile");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Card edit modes
  const [isEditingProfileDetails, setIsEditingProfileDetails] = useState(false);

  // Draft/Temporary values for form fields
  const [tempProfileName, setTempProfileName] = useState(profileName);
  const [tempProfilePhone, setTempProfilePhone] = useState(profilePhone);
  const [tempProfileLocation, setTempProfileLocation] = useState(profileLocation);
  const [tempProfileBioText, setTempProfileBioText] = useState(profileBioText);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);

  // Notification Preferences toggles
  const [notifyAccountActivity, setNotifyAccountActivity] = useState(true);
  const [notifySheetsSync, setNotifySheetsSync] = useState(true);
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(false);

  const getUserAvatarUrl = (key: string) => {
    switch (key) {
      case "cat":
        return "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=240";
      case "designer":
        return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=240";
      case "pixel":
        return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=240";
      case "ronald":
      default:
        return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240";
    }
  };

  const getAvatarBgColor = (key: string) => {
    switch (key) {
      case "ronald":
        return "bg-amber-400";
      case "cat":
        return "bg-pink-100";
      case "designer":
        return "bg-indigo-100";
      case "pixel":
        return "bg-slate-100";
      default:
        return "bg-yellow-400";
    }
  };

  const handleSaveProfileDetails = () => {
    setProfileName(tempProfileName);
    setProfileLocation(tempProfileLocation);
    setProfileBioText(tempProfileBioText);
    localStorage.setItem("profile_name", tempProfileName);
    localStorage.setItem("profile_location", tempProfileLocation);
    localStorage.setItem("profile_bio_text", tempProfileBioText);
    setIsEditingProfileDetails(false);
    triggerSuccess("Profile details updated successfully!");
  };

  const handleSelectAvatar = (key: string) => {
    setSelectedAvatar(key);
    localStorage.setItem("profile_selected_avatar", key);
    setIsAvatarSelectorOpen(false);
    triggerSuccess("Avatar photo updated!");
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };



  const sidebarItems = [
    { id: "edit-profile", label: "Edit Profile", icon: User, category: "Profile" },
    { id: "language", label: "Language", icon: Languages, category: "Profile" },
    { id: "notifications", label: "Notifications", icon: Bell, category: "Profile" },

    { id: "payments", label: "Payments", icon: CreditCard, category: "Bank" },
    { id: "taxes", label: "Taxes", icon: Landmark, category: "Bank" },
    { id: "transactions", label: "Transactions", icon: FileText, category: "Bank" },

    { id: "password", label: "Password", icon: Lock, category: "Secure" },
    { id: "access", label: "Access", icon: Shield, category: "Secure" },
    { id: "sessions", label: "Sessions", icon: CheckCircle2, category: "Secure" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Action Success Notification Alert Bar */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-semibold text-xs px-6 py-3.5 rounded-full shadow-2xl z-50 flex items-center space-x-2.5 border border-slate-800 backdrop-blur-md"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-screen sticky top-0 justify-between p-6 shrink-0 z-20">
        <div className="space-y-6">
          {/* Header Logo */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100/80">
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <LayoutGrid className="w-4.5 h-4.5" />
            </div>
            <span className="font-sans font-black text-base text-slate-900 tracking-tight">Gridlines UI</span>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-4">
            {["Profile", "Bank", "Secure"].map((category) => (
              <div key={category} className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1.5 mt-4 block px-3">
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
                            ? "bg-blue-50/60 border border-blue-100/30 text-blue-600 font-bold"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100/80">
          {/* Delete Account */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you absolutely sure you want to delete your account? This will permanently delete all your data and signups."
                )
              ) {
                handleSignout();
              }
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete account</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleSignout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>

          {/* Back home */}
          <button
            onClick={onClose}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180 text-slate-300" />
            <span>Back to Storefront</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <div className="md:hidden w-full bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <LayoutGrid className="w-3.5 h-3.5" />
          </div>
          <span className="font-sans font-black text-sm text-slate-900 tracking-tight">Gridlines UI</span>
        </div>
        <div className="flex items-center space-x-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-slate-200 cursor-pointer"
              onClick={() => setActiveSidebarTab("edit-profile")}
            />
          ) : (
            <div
              onClick={() => setActiveSidebarTab("edit-profile")}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-sans font-black text-[10px] border border-slate-200 cursor-pointer select-none"
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full"
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
                <div className="flex items-center justify-between pb-4 border-b border-slate-100/80">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <LayoutGrid className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-sans font-black text-sm text-slate-900 tracking-tight">Gridlines UI</span>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="space-y-4">
                  {["Profile", "Bank", "Secure"].map((category) => (
                    <div key={category} className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1.5 mt-2 block px-2">
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
                                  ? "bg-blue-50/60 border border-blue-100/30 text-blue-600 font-bold"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                              }`}
                            >
                              <IconComponent className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-slate-100/80 mt-6">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you absolutely sure you want to delete your account? This will permanently delete all your data and signups."
                      )
                    ) {
                      setIsMobileSidebarOpen(false);
                      handleSignout();
                    }
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete account</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleSignout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 min-h-screen p-5 sm:p-8 md:p-10 flex flex-col justify-start overflow-y-auto">


        {/* DYNAMIC TAB CONTROLLER */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-start w-full">
          {/* LEFT / CENTER CORE WORKSPACE ELEMENT */}
          <div className="flex-1 w-full space-y-6">
            {/* Active Tab Heading Title */}
            <div className="text-left mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeSidebarTab === "edit-profile" && "Edit Profile"}
                {activeSidebarTab === "language" && "Language Preferences"}
                {activeSidebarTab === "notifications" && "Alerts & Google Sheets"}
                {activeSidebarTab === "payments" && "Billing & Customer Invoice Hub"}
                {activeSidebarTab === "taxes" && "Taxes & Compliance"}
                {activeSidebarTab === "transactions" && "Database Registrations / Signups"}
                {activeSidebarTab === "password" && "Security credentials"}
                {activeSidebarTab === "access" && "Access & Credentials"}
                {activeSidebarTab === "sessions" && "Security Sessions Tracker"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {activeSidebarTab === "edit-profile" &&
                  "Manage your professional creator identity, contact, bio and location parameters."}
                {activeSidebarTab === "language" &&
                  "Select and lock down your preferred administrative language configuration."}
                {activeSidebarTab === "notifications" &&
                  "Configure email alerts and authorize external database sync bridges like Google Sheets."}
                {activeSidebarTab === "payments" &&
                  "View customer subscriptions, earnings reports, invoices, and plans."}
                {activeSidebarTab === "taxes" &&
                  "Retrieve annual earnings forms, 1099-NEC sheets and developer tax logs."}
                {activeSidebarTab === "transactions" &&
                  "Browse, audit, and sync live registration entries directly from Firestore to linked Sheets."}
                {activeSidebarTab === "password" &&
                  "Reset your secure portal credentials or test password validation parameters."}
                {activeSidebarTab === "access" &&
                  "Review account developer tokens, credentials, scopes, and specific auth schemas."}
                {activeSidebarTab === "sessions" &&
                  "Identify and manage active sessions across web browsers and terminal points."}
              </p>
            </div>

            {/* EDIT PROFILE TAB CONTENT */}
            {activeSidebarTab === "edit-profile" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-8 shadow-sm text-left">
                {/* PART 1: PHOTO / AVATAR ROW */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100/80">
                  <div className="shrink-0">
                    {user?.photoURL ? (
                      <div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-slate-50">
                        <img
                          src={user.photoURL}
                          alt={profileName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-sans font-black text-4xl">
                        {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <h3 className="font-bold text-lg text-slate-800">{profileName}</h3>
                    <p className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100/50 px-3 py-1 rounded-full inline-block">
                      Google Account Connected
                    </p>
                    <p className="text-xs text-slate-400 block pt-1">
                      Profile photo is automatically synced with your Google profile.
                    </p>
                  </div>
                </div>

                {/* PART 2: PROFILE DETAILS */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                    <h3 className="font-bold text-sm text-slate-900">Profile Details</h3>
                    {!isEditingProfileDetails ? (
                      <button
                        onClick={() => {
                          setTempProfileName(profileName);
                          setTempProfileLocation(profileLocation);
                          setTempProfileBioText(profileBioText);
                          setIsEditingProfileDetails(true);
                        }}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit Details</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsEditingProfileDetails(false)}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfileDetails}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                          <p className="text-xs font-bold text-slate-800">{profileName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                          <p className="text-xs font-medium text-slate-700 truncate">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                          <div className="flex items-center space-x-1 text-slate-800 text-xs font-bold">
                            <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{profileLocation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div className="space-y-2 pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Biography</p>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                          {profileBioText}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={tempProfileName}
                          onChange={(e) => setTempProfileName(e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Ronald Richards"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location / Country</label>
                        <div className="space-y-3.5 p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl">
                          {/* Selected Location Indicator */}
                          <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-xs">
                            <div className="flex items-center space-x-2.5">
                              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                <Compass className="w-4 h-4" />
                              </span>
                              <div className="text-left">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Selected Location</p>
                                <p className="text-xs font-black text-slate-800">
                                  {tempProfileLocation || "None Selected"}
                                </p>
                              </div>
                            </div>
                            {tempProfileLocation && (
                              <button
                                type="button"
                                onClick={() => setTempProfileLocation("")}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase transition-colors cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Popular/Quick Slider Track */}
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Suggested Countries</p>
                            <div className="flex space-x-2 overflow-x-auto pb-1.5 select-none -mx-1 px-1 touch-pan-x" style={{ scrollbarWidth: "thin" }}>
                              {[
                                { name: "United States", flag: "🇺🇸" },
                                { name: "India", flag: "🇮🇳" },
                                { name: "United Kingdom", flag: "🇬🇧" },
                                { name: "Canada", flag: "🇨🇦" },
                                { name: "Australia", flag: "🇦🇺" },
                                { name: "Germany", flag: "🇩🇪" },
                                { name: "France", flag: "🇫🇷" },
                                { name: "Japan", flag: "🇯🇵" },
                                { name: "Singapore", flag: "🇸🇬" },
                                { name: "United Arab Emirates", flag: "🇦🇪" }
                              ].map((country) => {
                                const isSelected = tempProfileLocation === country.name;
                                return (
                                  <button
                                    key={country.name}
                                    type="button"
                                    onClick={() => setTempProfileLocation(country.name)}
                                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/15"
                                        : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="text-sm">{country.flag}</span>
                                    <span>{country.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* All Countries List Box with Search */}
                          <div className="space-y-2 pt-3.5 border-t border-slate-200/40">
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search className="w-3.5 h-3.5 text-slate-400" />
                              </span>
                              <input
                                type="text"
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                                placeholder="Search from every country..."
                              />
                            </div>

                            {/* Scrollable list of every country */}
                            <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                              {ALL_COUNTRIES.filter((country) =>
                                country.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
                              ).map((country) => {
                                const isSelected = tempProfileLocation === country.name;
                                return (
                                  <button
                                    key={country.name}
                                    type="button"
                                    onClick={() => setTempProfileLocation(country.name)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-blue-50/60 text-blue-700 border-blue-500"
                                        : "bg-white text-slate-700 border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                                    }`}
                                  >
                                    <span className="text-base">{country.flag}</span>
                                    <span className="truncate">{country.name}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Biography</label>
                        <textarea
                          rows={4}
                          value={tempProfileBioText}
                          onChange={(e) => setTempProfileBioText(e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LANGUAGE TAB CONTENT */}
            {activeSidebarTab === "language" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Configure language profile</h3>
                  <p className="text-xs text-slate-400">
                    Select which dialect you wish Gridlines UI to render the workspace menus in.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    {
                      id: "english",
                      label: "English (US / UK)",
                      desc: "Primary administrative workspace language",
                      flag: "🇺🇸",
                    },
                    { id: "spanish", label: "Español (Spanish)", desc: "Soporte de traducción integrado", flag: "🇪🇸" },
                    { id: "french", label: "Français (French)", desc: "Traduction complète disponible", flag: "🇫🇷" },
                    { id: "japanese", label: "日本語 (Japanese)", desc: "日本語完全サポート", flag: "🇯🇵" },
                    { id: "german", label: "Deutsch (German)", desc: "Vollständige Lokalisierung", flag: "🇩🇪" },
                    { id: "hindi", label: "हिन्दी (Hindi)", desc: "पूर्ण अनुवाद उपलब्ध है", flag: "🇮🇳" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        localStorage.setItem("profile_language", lang.id);
                        triggerSuccess(`Language switched to ${lang.label}!`);
                      }}
                      className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                        selectedLanguage === lang.id
                          ? "bg-blue-50/50 border-blue-500 shadow-sm"
                          : "bg-white border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{lang.flag}</span>
                          <span className="text-xs font-bold text-slate-800">{lang.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight">{lang.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedLanguage === lang.id ? "border-blue-600 bg-blue-600" : "border-slate-200"
                        }`}
                      >
                        {selectedLanguage === lang.id && (
                          <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB CONTENT */}
            {activeSidebarTab === "notifications" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                  <div className="pb-4 border-b border-slate-50">
                    <h3 className="font-bold text-sm text-slate-900">Manage alerts & notifications</h3>
                    <p className="text-xs text-slate-400">Configure alert channels and push configurations.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5 text-left">
                        <p className="text-xs font-bold text-slate-800">Account activity alerts</p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Send push warnings whenever details are saved or updated.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={notifyAccountActivity}
                          onChange={(e) => setNotifyAccountActivity(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5 text-left">
                        <p className="text-xs font-bold text-slate-800">Google Sheets sync warnings</p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Notify active channels when new signups are synchronized.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={notifySheetsSync}
                          onChange={(e) => setNotifySheetsSync(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Toggle 3 */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5 text-left">
                        <p className="text-xs font-bold text-slate-800">Weekly roundup report</p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Receive a weekly designer summary of active storefront data.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={notifyWeeklySummary}
                          onChange={(e) => setNotifyWeeklySummary(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* GOOGLE SHEETS API CONNECTOR */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                  <div className="pb-4 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Google Sheets API Linkage</h3>
                      <p className="text-xs text-slate-400">
                        Sync all user registration signups from Firestore directly to a live spreadsheet.
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full ${
                        accessToken
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {accessToken ? "Authorized" : "Not Linked"}
                    </span>
                  </div>

                  {!accessToken ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        Authorize your Google Workspace credentials to enable background spreadsheet creation and
                        automatic cell synchronization.
                      </p>
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 inline-flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
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
                            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11.99 11.99 0 0 0 1.32 12c0 1.8.4 3.51 1.1 5l3.42-2.9z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Connect Google Sheets Scopes</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                            Active Spreadsheet Configuration
                          </span>
                          {spreadsheetId ? (
                            <p className="text-xs font-bold text-slate-700 font-mono truncate max-w-sm sm:max-w-md">
                              {spreadsheetId}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 font-medium">
                              No spreadsheet created yet. Generate one now!
                            </p>
                          )}
                        </div>
                        {spreadsheetId && (
                          <a
                            href={spreadsheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                          >
                            <span>Open Sheet</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {!spreadsheetId ? (
                        <button
                          onClick={handleCreateNewSheet}
                          disabled={isCreatingSheet}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>{isCreatingSheet ? "Provisioning..." : "Create new spreadsheet"}</span>
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={handleCreateNewSheet}
                            disabled={isCreatingSheet}
                            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Relink new sheet
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAYMENTS TAB CONTENT */}
            {activeSidebarTab === "payments" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Payments & Invoice History</h3>
                    <p className="text-xs text-slate-400">
                      View registered transactions, pricing tiers and billing logs.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Standard Plan
                  </span>
                </div>

                {/* Mock Billing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-1">
                    <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">Next billing date</p>
                    <p className="text-sm font-black text-slate-800">July 28, 2026</p>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-1">
                    <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">Current amount</p>
                    <p className="text-sm font-black text-slate-800">$19.00 / month</p>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-1">
                    <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                      Active payment point
                    </p>
                    <p className="text-sm font-black text-slate-800">•••• •••• •••• 4821</p>
                  </div>
                </div>

                {/* Payment Invoice List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Invoices Log</h4>
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                          <th className="py-3 px-4">Invoice ID</th>
                          <th className="py-3 px-4">Billing Date</th>
                          <th className="py-3 px-4">Service Package</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                        <tr>
                          <td className="py-3 px-4 font-mono text-slate-800">INV-84920</td>
                          <td className="py-3 px-4">June 28, 2026</td>
                          <td className="py-3 px-4">Gridlines UI Standard</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">$19.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono text-slate-800">INV-81245</td>
                          <td className="py-3 px-4">May 28, 2026</td>
                          <td className="py-3 px-4">Gridlines UI Standard</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">$19.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono text-slate-800">INV-79810</td>
                          <td className="py-3 px-4">April 28, 2026</td>
                          <td className="py-3 px-4">Gridlines UI Standard</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">$19.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAXES TAB CONTENT */}
            {activeSidebarTab === "taxes" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Taxes & Developer Earnings Compliance</h3>
                  <p className="text-xs text-slate-400">
                    Download IRS forms, printable statements and tax certifications.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">W-9 Form (Taxpayer Identification)</p>
                      <p className="text-[10px] text-slate-400">Required for active developers receiving payouts.</p>
                    </div>
                    <button
                      onClick={() => alert("W-9 document download simulated successfully!")}
                      className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Download PDF
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">1099-NEC (Non-employee compensation)</p>
                      <p className="text-[10px] text-slate-400">
                        Fiscal year 2025 statement of earned storefront referrals.
                      </p>
                    </div>
                    <button
                      onClick={() => alert("1099-NEC statement download simulated successfully!")}
                      className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSACTIONS TAB CONTENT (REAL FIRESTORE DATABASE LIST) */}
            {activeSidebarTab === "transactions" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-slate-900">Active Registrations & Transactions</h3>
                    <p className="text-xs text-slate-400">
                      Database entries submitted via your promotional landing pages.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        refreshSignups();
                        triggerSuccess("Database refetched!");
                      }}
                      className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
                      title="Reload Database"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    {accessToken && (
                      <button
                        onClick={handleSyncToSheet}
                        disabled={isSyncing || !spreadsheetId}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>{isSyncing ? "Syncing cells..." : "Sync to Google Sheets"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Firestore records list */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                        <th className="py-3.5 px-5">Participant Name</th>
                        <th className="py-3.5 px-5">Email Address</th>
                        <th className="py-3.5 px-5">Registration Date</th>
                        <th className="py-3.5 px-5">Access Provider</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                      {signupsList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 px-5 text-center text-slate-400">
                            No registrations detected in Firestore yet. Promote your landing pages to collect entries.
                          </td>
                        </tr>
                      ) : (
                        signupsList.map((signup, i) => (
                          <tr key={signup.id || i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-5 font-bold text-slate-800">{signup.name}</td>
                            <td className="py-3 px-5 font-mono text-slate-500">{signup.email}</td>
                            <td className="py-3 px-5 text-slate-400">{signup.date || "Unknown date"}</td>
                            <td className="py-3 px-5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  signup.provider === "google.com"
                                    ? "bg-blue-50 text-blue-600 border border-blue-100/30"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {signup.provider === "google.com" ? "Google Link" : "Email Auth"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PASSWORD TAB CONTENT */}
            {activeSidebarTab === "password" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Manage Portal Credentials</h3>
                  <p className="text-xs text-slate-400">
                    Send password reset parameters directly to your active inbox.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    You are logged in as <strong>{user?.email}</strong>. For maximum security, we manage password updates
                    through secure email reset links verified directly by Firebase.
                  </p>
                  <button
                    onClick={async () => {
                      if (!user?.email) return;
                      try {
                        await sendForgotPasswordEmail(user.email);
                        triggerSuccess("Reset email successfully dispatched!");
                      } catch (err: any) {
                        alert(err.message || "Failed to trigger email.");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 inline-flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4 mr-1 shrink-0" />
                    <span>Send Password Reset Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* ACCESS TAB CONTENT */}
            {activeSidebarTab === "access" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Workspace Developer Credentials</h3>
                  <p className="text-xs text-slate-400">
                    Review technical credentials, API authorizations, scopes and identifiers.
                  </p>
                </div>

                <div className="space-y-4 font-mono text-[11px] text-slate-600 divide-y divide-slate-100">
                  <div className="py-2.5 flex justify-between gap-4 text-left">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Account Role</span>
                    <span className="font-bold text-slate-800">Administrator / Creator</span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4 text-left">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Firebase Unique ID (UID)</span>
                    <span className="text-slate-700 select-all truncate max-w-sm sm:max-w-md">{user?.uid}</span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4 text-left">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Authentication Provider</span>
                    <span className="font-bold uppercase text-slate-800">
                      {user?.providerId || "firebase-auth-suite"}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4 text-left">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Verified State</span>
                    <span className="font-bold text-emerald-600 uppercase">
                      {user?.emailVerified ? "Verified True" : "Verified False (Auth Provider Signed)"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SESSIONS TAB CONTENT */}
            {activeSidebarTab === "sessions" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-left">
                <div className="pb-4 border-b border-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Security Sessions Tracker</h3>
                  <p className="text-xs text-slate-400">
                    Review where you are currently logged into the Gridlines UI workspace.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-xl flex items-center justify-between gap-4 text-left">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Chrome Web Browser on macOS</span>
                        <span className="bg-blue-600 text-white font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Current Session
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">IP: 198.162.24.18 • California, United States</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 text-left">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-600">Gridlines UI CLI Terminal (Node.js)</p>
                      <p className="text-[10px] text-slate-400">IP: 34.120.88.94 • Council Bluffs, IA</p>
                    </div>
                    <button
                      onClick={() => alert("Revoked CLI session successfully!")}
                      className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl"
                    >
                      Revoke Access
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


        </div>
      </main>
    </div>
  );
};
