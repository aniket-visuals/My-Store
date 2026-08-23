import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { Search, Plus, Edit, Trash2, Key, ShieldAlert, CheckCircle, SearchX, X, MoreVertical, CheckSquare, Square, Smartphone, Lock } from "lucide-react";

export interface OmniUser {
  id: string; // The username is the key
  username: string;
  hasPassword?: boolean;
  hashPreview?: string;
  status: string;
  activeSession?: {
    deviceId: string;
    token: string;
    updatedAt: number;
  };
}

export default function OmniToolUsers() {
  const [users, setUsers] = useState<OmniUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentUser, setCurrentUser] = useState<Partial<OmniUser>>({});
  const [newPassword, setNewPassword] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/omnitool/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      showToast(`Failed to load users: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

        const res = await fetch(`/api/omnitool/users/${currentUser.id}`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update user");

        showToast("User updated successfully", "success");
      }
      
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (error: any) {
      showToast(error.message || "Error saving user", "error");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
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
      if (!window.confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)) return;
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
      fetchUsers();
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

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border animate-fade-in flex items-center gap-2
          ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-brand-dark mb-1">OmniTool Users</h2>
          <p className="text-brand-dark/60 text-sm">Manage user accounts and active sessions.</p>
        </div>
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

      {/* Table */}
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
                <th className="px-4 py-3">Active Session</th>
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
                currentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-brand-dark/[0.02] transition-colors">
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleSelectUser(user.id)} className="text-brand-dark/40 hover:text-brand-dark transition-colors">
                        {selectedUsers.has(user.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-dark">{user.username}</td>
                    <td 
                      className="px-4 py-3 font-mono text-xs text-brand-dark/80 bg-brand-dark/[0.02] rounded px-2"
                      title="Passwords are encrypted using bcrypt (one-way hashing). The plain text password is mathematically unrecoverable."
                    >
                      {user.hashPreview ? (
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-500" />
                          {user.hashPreview}
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
                      {user.activeSession ? (
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
                          className="p-1.5 text-brand-dark/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-brand-dark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-brand-dark/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-xl text-brand-dark">
                {modalMode === "add" ? "Add New User" : "Edit User"}
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
                    placeholder="e.g. admin"
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
                      placeholder="e.g. admin123password"
                    />
                  </div>
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

