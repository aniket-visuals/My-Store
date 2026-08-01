import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { StatItem } from "../types";
import { STATS_DATA } from "../data";
import { Edit, Save, Plus, X } from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StatItem | null>(null);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    const q = query(collection(db, "stats"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setStats(STATS_DATA.map((s, idx) => ({ ...s, order: idx } as any)));
        setLoading(false);
      } else {
        const statsData: StatItem[] = [];
        snapshot.forEach((doc) => {
          statsData.push({ id: doc.id, ...doc.data() } as StatItem);
        });
        setStats(statsData);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching stats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditClick = (stat: StatItem) => {
    setEditingId(stat.id);
    setEditForm(stat);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      const statRef = doc(db, "stats", editForm.id);
      await setDoc(statRef, editForm, { merge: true });
      showToast("Stat updated successfully", "success");
      setEditingId(null);
      setEditForm(null);
    } catch (error) {
      console.error("Error updating stat:", error);
      showToast("Failed to update stat", "error");
    }
  };

  const initializeDefaultStats = async () => {
    try {
      for (let i = 0; i < STATS_DATA.length; i++) {
        const stat = STATS_DATA[i];
        const statRef = doc(db, "stats", stat.id);
        await setDoc(statRef, { ...stat, order: i });
      }
      showToast("Default stats initialized", "success");
    } catch (error) {
      console.error("Error initializing stats:", error);
      showToast("Failed to initialize stats", "error");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-brand-dark/40 font-medium">Loading stats...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-dark/5 shadow-sm p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-brand-dark">Community Stats</h3>
          <p className="text-sm text-brand-dark/60 mt-1">Manage the numbers shown in the "Why Choose Us" section on the landing page.</p>
        </div>
        <button 
          onClick={initializeDefaultStats}
          className="px-4 py-2 bg-brand-dark/5 hover:bg-brand-dark/10 text-brand-dark font-medium rounded-xl text-sm transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl flex items-center text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.id} className="p-4 border border-brand-dark/10 rounded-xl bg-brand-bg transition-colors">
            {editingId === stat.id && editForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-brand-dark/60 mb-1">Value (e.g., 100K+, 99%)</label>
                    <input
                      type="text"
                      value={editForm.value}
                      onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-dark/60 mb-1">Label</label>
                    <input
                      type="text"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-brand-dark/60 hover:bg-brand-dark/5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium bg-brand-dark text-white hover:bg-brand-dark/90 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-display font-bold text-brand-dark">{stat.value}</p>
                  <p className="text-sm font-bold text-brand-dark mt-1">{stat.label}</p>
                </div>
                <button
                  onClick={() => handleEditClick(stat)}
                  className="p-2 text-brand-dark/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
