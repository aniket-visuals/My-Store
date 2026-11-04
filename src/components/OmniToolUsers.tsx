import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { 
  Search, Plus, Edit, Trash2, Key, ShieldAlert, CheckCircle, SearchX, X, 
  CheckSquare, Square, Smartphone, Lock, Laptop, Monitor, Power, Ban, 
  RefreshCw, Copy, Check, Sliders
} from "lucide-react";

export interface OmniUser {
  id: string; // The username is the key
  username: string;
  hasPassword?: boolean;
  hashPreview?: string;
  status: string;
  isSpecialMultiDevice?: boolean;
  activeDeviceCount?: number;
  deviceLimitMode?: "limited" | "unlimited";
  maxDeviceLimit?: number;
  activeSession?: {
    deviceId: string;
    token: string;
    updatedAt: number;
  };
}

export interface DemoSession {
  deviceId: string;
  platform: string;
  loginAt: number;
  lastActiveAt: number;
  status: "active" | "inactive" | "terminated";
}

export interface DemoAccountData {
  username: string;
  status: "active" | "disabled";
  deviceLimitMode: "limited" | "unlimited";
  maxDeviceLimit: number;
  activeDeviceCount: number;
  totalSessionsCount: number;
  sessions: DemoSession[];
}

export default function OmniToolUsers() {
  const [users, setUsers] = useState<OmniUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // Demo Account Special State with safe default values
  const [demoData, setDemoData] = useState<DemoAccountData>({
    username: "Demo",
    status: "active",
    deviceLimitMode: "limited",
    maxDeviceLimit: 10,
    activeDeviceCount: 0,
    totalSessionsCount: 0,
    sessions: []
  });
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoLimitInput, setDemoLimitInput] = useState<number>(10);
  const [isUpdatingDemo, setIsUpdatingDemo] = useState(false);
  const [showDemoDevicesModal, setShowDemoDevicesModal] = useState(false);
  const [copiedDeviceId, setCopiedDeviceId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentUser, setCurrentUser] = useState<Partial<OmniUser>>({});
  const [newPassword, setNewPassword] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getAdminToken = async (): Promise<string | null> => {
    let token = await auth.currentUser?.getIdToken();
    if (!token) {
      await new Promise(r => setTimeout(r, 400));
      token = await auth.currentUser?.getIdToken();
    }
    return token || null;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getAdminToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/omnitool/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      showToast(`Failed to load users: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDemoData = async () => {
    try {
      setLoadingDemo(true);
      const token = await getAdminToken();
      if (!token) return;

      const res = await fetch("/api/omnitool/demo", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDemoData(data);
        if (typeof data.maxDeviceLimit === "number") {
          setDemoLimitInput(data.maxDeviceLimit);
        }
      }
    } catch (error: any) {
      console.error("Error fetching Demo account:", error);
    } finally {
      setLoadingDemo(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDemoData();
  }, []);

  // Helper to update Demo config with automatic endpoint fallback
  const updateDemoConfigApi = async (body: any) => {
    const token = await getAdminToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch("/api/omnitool/demo/config", {
      method: "PUT",
      headers,
      body: JSON.stringify(body)
    });

    if (res.status === 404) {
      // Fallback to /api/omnitool/demo
      res = await fetch("/api/omnitool/demo", {
        method: "PUT",
        headers,
        body: JSON.stringify(body)
      });
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Server returned ${res.status}`);
    }

    return res.json().catch(() => ({}));
  };

  // Toggle Demo Account Activation / Deactivation
  const handleToggleDemoStatus = async () => {
    const nextStatus = demoData.status === "active" ? "disabled" : "active";

    if (nextStatus === "disabled") {
      const confirmDeactivate = window.confirm(
        "Disabling the Demo account will immediately terminate and disconnect all active devices. Are you sure?"
      );
      if (!confirmDeactivate) return;
    }

    try {
      setIsUpdatingDemo(true);
      await updateDemoConfigApi({ status: nextStatus });

      setDemoData(prev => ({
        ...prev,
        status: nextStatus,
        activeDeviceCount: nextStatus === "disabled" ? 0 : prev.activeDeviceCount,
        sessions: nextStatus === "disabled" 
          ? prev.sessions.map(s => ({ ...s, status: "terminated" }))
          : prev.sessions
      }));

      showToast(
        nextStatus === "active" 
          ? "Demo account is now ACTIVE." 
          : "Demo account DISABLED. All active device sessions invalidated immediately.", 
        nextStatus === "active" ? "success" : "error"
      );
      await Promise.all([fetchDemoData(), fetchUsers()]);
    } catch (err: any) {
      showToast(err.message || "Failed to update Demo status", "error");
    } finally {
      setIsUpdatingDemo(false);
    }
  };

  // Switch between Limited and Unlimited Device modes
  const handleSetDemoLimitMode = async (mode: "limited" | "unlimited") => {
    try {
      setIsUpdatingDemo(true);
      const limitVal = mode === "limited" ? (demoLimitInput || 10) : demoData.maxDeviceLimit;

      await updateDemoConfigApi({ 
        deviceLimitMode: mode,
        maxDeviceLimit: limitVal
      });

      setDemoData(prev => ({
        ...prev,
        deviceLimitMode: mode,
        maxDeviceLimit: limitVal
      }));

      showToast(
        mode === "unlimited"
          ? "Demo account set to UNLIMITED devices."
          : `Demo account set to LIMITED (${limitVal} devices max).`,
        "success"
      );
      await Promise.all([fetchDemoData(), fetchUsers()]);
    } catch (err: any) {
      showToast(err.message || "Failed to change device limit mode", "error");
    } finally {
      setIsUpdatingDemo(false);
    }
  };

  // Save new device limit count
  const handleSaveDemoLimit = async (customLimit?: number) => {
    const limitToSave = customLimit !== undefined ? customLimit : demoLimitInput;
    if (limitToSave < 1) {
      showToast("Device limit must be at least 1", "error");
      return;
    }

    try {
      setIsUpdatingDemo(true);
      await updateDemoConfigApi({ 
        deviceLimitMode: "limited",
        maxDeviceLimit: limitToSave 
      });

      setDemoLimitInput(limitToSave);
      setDemoData(prev => ({
        ...prev,
        deviceLimitMode: "limited",
        maxDeviceLimit: limitToSave
      }));

      showToast(`Demo maximum device limit updated to ${limitToSave} devices.`, "success");
      await Promise.all([fetchDemoData(), fetchUsers()]);
    } catch (err: any) {
      showToast(err.message || "Failed to save device limit", "error");
    } finally {
      setIsUpdatingDemo(false);
    }
  };

  // Terminate an individual device session
  const handleTerminateSession = async (deviceId: string) => {
    try {
      const token = await getAdminToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch("/api/omnitool/demo/terminate-session", {
        method: "POST",
        headers,
        body: JSON.stringify({ deviceId })
      });

      if (res.status === 404) {
        res = await fetch("/api/omnitool/demo/terminate", {
          method: "POST",
          headers,
          body: JSON.stringify({ deviceId })
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server returned ${res.status}`);
      }

      showToast(`Session for device ${deviceId.slice(0, 10)}... terminated.`, "success");
      await Promise.all([fetchDemoData(), fetchUsers()]);
    } catch (err: any) {
      showToast(err.message || "Failed to terminate device", "error");
    }
  };

  // Terminate all active sessions at once
  const handleTerminateAllSessions = async () => {
    const confirmAll = window.confirm(
      "Are you sure you want to terminate ALL active sessions for Demo? All currently connected devices will be logged out immediately."
    );
    if (!confirmAll) return;

    try {
      setIsUpdatingDemo(true);
      const token = await getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch("/api/omnitool/demo/terminate-all", {
        method: "POST",
        headers
      });

      if (res.status === 404) {
        res = await fetch("/api/omnitool/demo/terminate-all-sessions", {
          method: "POST",
          headers
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server returned ${res.status}`);
      }

      showToast("All active Demo sessions have been terminated.", "success");
      await Promise.all([fetchDemoData(), fetchUsers()]);
    } catch (err: any) {
      showToast(err.message || "Failed to terminate all sessions", "error");
    } finally {
      setIsUpdatingDemo(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDeviceId(text);
    setTimeout(() => setCopiedDeviceId(null), 2000);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "add" && !currentUser.username) {
      showToast("Username is required", "error");
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      if (modalMode === "add") {
        if (!newPassword) {
          showToast("Password is required for new users", "error");
          return;
        }

        const username = currentUser.username!.trim();
        if (/[.#$\[\]]/.test(username)) {
          showToast("Username contains invalid characters", "error");
          return;
        }

        const res = await fetch("/api/omnitool/users", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            password: newPassword,
            status: currentUser.status || "active"
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create user");
        
        showToast("User created successfully", "success");
      } else {
        if (!currentUser.id) return;
        
        const payload: any = {
          status: currentUser.status,
        };
        if (newPassword) {
          payload.password = newPassword;
        }

        if (currentUser.id?.toLowerCase() === "demo") {
          await updateDemoConfigApi(payload);
        } else {
          const res = await fetch(`/api/omnitool/users/${currentUser.id}`, {
            method: "PUT",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || data.error || `Server returned ${res.status}`);
        }

        showToast("User updated successfully", "success");
      }
      
      setIsModalOpen(false);
      await Promise.all([fetchUsers(), fetchDemoData()]);
    } catch (error: any) {
      showToast(error.message || "Error saving user", "error");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.toLowerCase() === "demo") {
      showToast("The Demo system account cannot be deleted. You can disable it instead.", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${id}? This action cannot be undone.`)) return;
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/omnitool/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      
      showToast("User deleted", "success");
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete user", "error");
    }
  };

  const handleBulkAction = async (action: "active" | "disabled" | "delete") => {
    if (selectedUsers.size === 0) return;
    
    if (action === "delete") {
      const targets = Array.from(selectedUsers).filter((id: string) => id.toLowerCase() !== "demo");
      if (targets.length === 0) {
        showToast("Demo account cannot be deleted.", "error");
        return;
      }
      if (!window.confirm(`Are you sure you want to delete ${targets.length} users?`)) return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/omnitool/users/bulk", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          userIds: Array.from(selectedUsers)
        })
      });

      if (!res.ok) throw new Error("Bulk action failed");
      
      showToast(`Bulk action completed`, "success");
      setSelectedUsers(new Set());
      await Promise.all([fetchUsers(), fetchDemoData()]);
    } catch (error) {
      console.error(error);
      showToast("Bulk action failed", "error");
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === currentUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(currentUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUsers(newSet);
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || user.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    disabled: users.filter(u => u.status === "disabled").length,
  };

  // Connected devices for Demo
  const demoActiveSessions = (demoData?.sessions || []).filter(s => s.status === "active");

  return (
    <div className="space-y-6 animate-fade-in relative text-left">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border animate-fade-in flex items-center gap-2
          ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-brand-dark mb-1">OmniTool Users</h2>
          <p className="text-brand-dark/60 text-sm">Manage user accounts, active sessions, and special multi-device settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchUsers();
              fetchDemoData();
            }}
            className="p-2.5 rounded-xl border border-brand-dark/10 bg-white hover:bg-brand-dark/5 text-brand-dark/70 transition-colors"
            title="Refresh All"
          >
            <RefreshCw className={`w-4 h-4 ${loading || loadingDemo ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setModalMode("add");
              setCurrentUser({ status: "active" });
              setNewPassword("");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-brand-dark font-bold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Create User
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SPECIAL DEMO ACCOUNT MANAGEMENT CARD (Multi-Device Login)                  */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-white to-amber-500/[0.03] border-2 border-brand-primary/25 rounded-3xl p-6 shadow-md shadow-brand-dark/[0.02] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Demo Card */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-brand-dark/10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-display font-bold text-xl text-brand-dark flex items-center gap-2">
                <Laptop className="w-6 h-6 text-brand-primary" />
                <span>Demo Account</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-brand-primary/15 text-brand-dark border border-brand-primary/20 uppercase tracking-wider">
                Multi-Device Enabled
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                demoData?.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {demoData?.status === "active" ? "● Active" : "● Disabled"}
              </span>
            </div>

            {/* Canonical Formatted Status Line: Demo | 4 Active Devices | Limit: 10 */}
            <div className="pt-1 flex items-center gap-2 font-mono text-xs font-semibold text-brand-dark/80">
              <span className="bg-brand-dark/5 px-2.5 py-1 rounded-lg border border-brand-dark/10">
                Demo
              </span>
              <span className="text-brand-dark/40">•</span>
              <span className="bg-emerald-500/10 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                {demoData?.activeDeviceCount || 0} Active Devices
              </span>
              <span className="text-brand-dark/40">•</span>
              <span className="bg-brand-primary/10 text-brand-dark px-2.5 py-1 rounded-lg border border-brand-primary/20 font-bold">
                Limit: {demoData?.deviceLimitMode === "unlimited" ? "Unlimited" : (demoData?.maxDeviceLimit || 10)}
              </span>
            </div>
          </div>

          {/* Action Buttons for Demo */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowDemoDevicesModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-brand-dark/15 bg-white hover:bg-brand-dark/5 text-brand-dark font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-brand-primary" />
              <span>Inspect Devices ({demoActiveSessions.length})</span>
            </button>

            <button
              onClick={handleTerminateAllSessions}
              disabled={isUpdatingDemo || demoActiveSessions.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              title="Terminate all active devices at once"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Terminate All Sessions</span>
            </button>

            <button
              onClick={handleToggleDemoStatus}
              disabled={isUpdatingDemo}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-sm ${
                demoData?.status === "active"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{demoData?.status === "active" ? "Deactivate Account" : "Activate Account"}</span>
            </button>
          </div>
        </div>

        {/* Bottom Configuration Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-center">
          {/* Mode Selector */}
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/60">
              Device Limit Mode
            </label>
            <div className="grid grid-cols-2 gap-2 bg-brand-dark/5 p-1 rounded-2xl border border-brand-dark/10">
              <button
                type="button"
                onClick={() => handleSetDemoLimitMode("limited")}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  demoData?.deviceLimitMode !== "unlimited"
                    ? "bg-white text-brand-dark shadow-sm border border-brand-dark/10"
                    : "text-brand-dark/60 hover:text-brand-dark"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Limited Devices</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetDemoLimitMode("unlimited")}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  demoData?.deviceLimitMode === "unlimited"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-brand-dark/60 hover:text-brand-dark"
                }`}
              >
                <span>Unlimited Devices</span>
              </button>
            </div>
          </div>

          {/* Device Limit Input & Presets (When in Limited Mode) */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/60">
                Max Allowed Devices
              </label>
              {demoData?.deviceLimitMode === "unlimited" && (
                <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Unlimited Mode Active
                </span>
              )}
            </div>

            {demoData?.deviceLimitMode === "unlimited" ? (
              <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Any number of devices can log in simultaneously without restriction.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={demoLimitInput}
                    onChange={(e) => setDemoLimitInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-brand-dark/15 bg-white text-brand-dark font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-brand-dark/40 font-medium pointer-events-none">
                    devices
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[2, 5, 10, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setDemoLimitInput(preset);
                        handleSaveDemoLimit(preset);
                      }}
                      className={`px-2.5 py-2 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        demoData?.maxDeviceLimit === preset
                          ? "bg-brand-primary text-brand-dark border-brand-primary"
                          : "bg-white text-brand-dark/70 border-brand-dark/10 hover:bg-brand-dark/5"
                      }`}
                      title={`Set limit to ${preset}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveDemoLimit()}
                  disabled={isUpdatingDemo}
                  className="px-4 py-2 bg-brand-dark hover:bg-brand-primary text-white hover:text-brand-dark text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer shadow-sm shrink-0"
                >
                  Save Limit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notice on single-device restriction for all other accounts */}
        <div className="mt-4 pt-3 border-t border-brand-dark/5 flex items-center justify-between text-[11px] font-mono text-brand-dark/50">
          <span>
            ℹ️ Multi-device login applies <strong>exclusively to the Demo account</strong>. All other accounts remain strictly single-device enforced.
          </span>
          <span className="hidden sm:inline">
            Default credentials: <strong className="text-brand-dark font-bold">Demo / Demo123</strong>
          </span>
        </div>
      </div>

      {/* Global User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-brand-dark/10 shadow-sm">
          <p className="text-sm text-brand-dark/60 font-medium mb-1">Total Users</p>
          <p className="text-2xl font-bold text-brand-dark">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-brand-dark/10 shadow-sm">
          <p className="text-sm text-brand-dark/60 font-medium mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-brand-dark/10 shadow-sm">
          <p className="text-sm text-brand-dark/60 font-medium mb-1">Disabled</p>
          <p className="text-2xl font-bold text-red-600">{stats.disabled}</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-brand-dark/10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-brand-dark/60 mr-2">{selectedUsers.size} selected</span>
            <button onClick={() => handleBulkAction("active")} className="px-3 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">Enable</button>
            <button onClick={() => handleBulkAction("disabled")} className="px-3 py-1.5 text-xs font-bold bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">Disable</button>
            <button onClick={() => handleBulkAction("delete")} className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Delete</button>
          </div>
        )}
      </div>

      {/* Table of Users */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark/5 text-brand-dark/60 font-medium">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-brand-dark/40 hover:text-brand-dark transition-colors">
                    {selectedUsers.size === currentUsers.length && currentUsers.length > 0 ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Active Session(s)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-dark/40">Loading users...</td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <SearchX className="w-8 h-8 text-brand-dark/20 mx-auto mb-3" />
                    <p className="text-brand-dark/60 font-medium">No users found</p>
                  </td>
                </tr>
              ) : (
                currentUsers.map(user => {
                  const isDemo = user.id.toLowerCase() === "demo";

                  return (
                    <tr 
                      key={user.id} 
                      className={`transition-colors ${isDemo ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]" : "hover:bg-brand-dark/[0.02]"}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleSelectUser(user.id)} className="text-brand-dark/40 hover:text-brand-dark transition-colors">
                          {selectedUsers.has(user.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-dark">{user.username}</span>
                          {isDemo && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-primary/20 text-brand-dark border border-brand-primary/30 uppercase">
                              Multi-Device
                            </span>
                          )}
                        </div>
                      </td>
                      <td 
                        className="px-4 py-3 font-mono text-xs text-brand-dark/80"
                        title="Passwords are encrypted using bcrypt (one-way hashing). The plain text password is mathematically unrecoverable."
                      >
                        {user.hashPreview ? (
                          <span className="flex items-center gap-1 bg-brand-dark/[0.03] px-2 py-1 rounded w-max">
                            <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{user.hashPreview}</span>
                          </span>
                        ) : user.hasPassword ? (
                          "••••••••"
                        ) : (
                          "No Password"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {user.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isDemo ? (
                          <div className="flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-brand-primary shrink-0" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-brand-dark">
                                  {demoData?.activeDeviceCount ?? user.activeDeviceCount ?? 0} Active
                                </span>
                                <span className="text-[10px] font-mono text-brand-dark/50">
                                  ({demoData?.deviceLimitMode === "unlimited" ? "Unlimited" : `Limit: ${demoData?.maxDeviceLimit || 10}`})
                                </span>
                              </div>
                              <button
                                onClick={() => setShowDemoDevicesModal(true)}
                                className="text-[10px] font-mono text-brand-primary hover:underline font-bold"
                              >
                                View all devices →
                              </button>
                            </div>
                          </div>
                        ) : user.activeSession ? (
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-500" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-brand-dark truncate max-w-[150px]" title={user.activeSession.deviceId}>
                                {user.activeSession.deviceId}
                              </span>
                              <span className="text-[10px] text-brand-dark/40">
                                {new Date(user.activeSession.updatedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-brand-dark/40 text-xs">No active session</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setModalMode("edit");
                              setCurrentUser(user);
                              setNewPassword("");
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-brand-dark/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!isDemo && (
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-brand-dark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-brand-dark/5 flex items-center justify-between bg-brand-dark/[0.01]">
            <p className="text-sm text-brand-dark/60">
              Showing <span className="font-medium text-brand-dark">{indexOfFirst + 1}</span> to <span className="font-medium text-brand-dark">{Math.min(indexOfLast, filteredUsers.length)}</span> of <span className="font-medium text-brand-dark">{filteredUsers.length}</span> users
            </p>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-brand-dark/10 text-sm font-medium disabled:opacity-50 hover:bg-white"
              >
                Prev
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-brand-dark/10 text-sm font-medium disabled:opacity-50 hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CONNECTED DEVICES INSPECTOR MODAL FOR DEMO ACCOUNT                         */}
      {/* ========================================================================= */}
      {showDemoDevicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl border border-brand-dark/10 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-brand-dark/10">
              <div>
                <h3 className="font-display font-bold text-xl text-brand-dark flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-brand-primary" />
                  <span>Connected Devices — Demo Account</span>
                </h3>
                <p className="text-xs font-mono text-brand-dark/60 mt-0.5">
                  Currently connected devices, platform data, and individual session controls.
                </p>
              </div>
              <button 
                onClick={() => setShowDemoDevicesModal(false)}
                className="p-1.5 text-brand-dark/40 hover:text-brand-dark rounded-lg hover:bg-brand-dark/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick summary header inside modal */}
            <div className="py-3 px-4 my-4 bg-brand-dark/[0.02] border border-brand-dark/10 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand-dark">
                  Active Devices: <span className="text-emerald-700 font-extrabold">{demoActiveSessions.length}</span>
                </span>
                <span className="text-brand-dark/30">•</span>
                <span className="font-bold text-brand-dark">
                  Configured Limit: <span className="text-brand-primary font-extrabold">{demoData?.deviceLimitMode === "unlimited" ? "Unlimited" : demoData?.maxDeviceLimit}</span>
                </span>
              </div>
              {demoActiveSessions.length > 0 && (
                <button
                  onClick={handleTerminateAllSessions}
                  className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Terminate All Active
                </button>
              )}
            </div>

            {/* Devices list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {!demoData?.sessions || demoData.sessions.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-brand-dark/10 rounded-2xl bg-brand-dark/[0.01]">
                  <Smartphone className="w-10 h-10 text-brand-dark/20 mx-auto mb-2" />
                  <p className="text-sm font-bold text-brand-dark/70">No devices connected yet</p>
                  <p className="text-xs font-mono text-brand-dark/40 mt-1 max-w-sm mx-auto">
                    When users log into the After Effects extension using Demo / Demo123, their devices will automatically appear here.
                  </p>
                </div>
              ) : (
                demoData.sessions.map((session, index) => {
                  const isActive = session.status === "active";
                  const isMac = /mac/i.test(session.platform);

                  return (
                    <div 
                      key={session.deviceId || index}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isActive 
                          ? "bg-white border-brand-dark/10 shadow-sm hover:border-brand-primary/40" 
                          : "bg-brand-dark/[0.02] border-brand-dark/5 opacity-70"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isActive 
                            ? "bg-brand-primary/10 border-brand-primary/20 text-brand-dark" 
                            : "bg-brand-dark/5 border-brand-dark/10 text-brand-dark/40"
                        }`}>
                          {isMac ? <Laptop className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-dark truncate max-w-[220px]" title={session.deviceId}>
                              {session.deviceId}
                            </span>
                            <button
                              onClick={() => handleCopy(session.deviceId)}
                              className="text-brand-dark/30 hover:text-brand-dark p-0.5 rounded transition-colors"
                              title="Copy device ID"
                            >
                              {copiedDeviceId === session.deviceId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isActive 
                                ? "bg-emerald-100 text-emerald-800" 
                                : session.status === "terminated"
                                ? "bg-red-100 text-red-800"
                                : "bg-neutral-100 text-neutral-600"
                            }`}>
                              {session.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-brand-dark/50">
                            <span>OS: <strong className="text-brand-dark/80">{session.platform || "Desktop"}</strong></span>
                            <span>•</span>
                            <span>Login: <strong className="text-brand-dark/80">{new Date(session.loginAt).toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Last Active: <strong className="text-brand-dark/80">{new Date(session.lastActiveAt).toLocaleTimeString()}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Action for this device */}
                      {isActive && (
                        <button
                          onClick={() => handleTerminateSession(session.deviceId)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                          title="Terminate this device session immediately"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-brand-dark/10 flex justify-end">
              <button
                onClick={() => setShowDemoDevicesModal(false)}
                className="px-5 py-2.5 rounded-xl bg-brand-dark text-white font-mono text-xs font-bold hover:bg-brand-dark/90 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-brand-dark/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-xl text-brand-dark">
                {modalMode === "add" ? "Add New User" : `Edit User: ${currentUser.username}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-dark/40 hover:text-brand-dark p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === "edit"}
                    value={currentUser.username || ""}
                    onChange={e => setCurrentUser({...currentUser, username: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm disabled:opacity-50"
                    placeholder="e.g. CreatorStudio"
                  />
                  {modalMode === "edit" && (
                    <p className="text-xs text-brand-dark/40 mt-1">Username cannot be changed</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">
                    {modalMode === "add" ? "Password *" : "New Password (leave blank to keep current)"}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                    <input
                      type="text"
                      required={modalMode === "add"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm font-mono"
                      placeholder={currentUser.id?.toLowerCase() === "demo" ? "e.g. Demo123" : "e.g. userPassword123"}
                    />
                  </div>
                  {currentUser.id?.toLowerCase() === "demo" && (
                    <p className="text-xs text-amber-700 font-mono mt-1">
                      Note: Default password for Demo is <span className="font-bold">Demo123</span>. Updating this will require extension users to use the new password.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Status</label>
                  <select
                    value={currentUser.status || "active"}
                    onChange={e => setCurrentUser({...currentUser, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-2 border-t border-brand-dark/5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-brand-dark font-medium hover:bg-brand-dark/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-dark/90 transition-colors text-sm"
                >
                  {modalMode === "add" ? "Create User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
