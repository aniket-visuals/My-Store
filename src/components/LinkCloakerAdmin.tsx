import React, { useState, useEffect } from "react";
import { 
  CloakedLink, 
  getCloakedLinks, 
  saveCloakedLink, 
  deleteCloakedLink 
} from "../services/linkService";
import { 
  Link as LinkIcon, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Search, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  BarChart2, 
  Edit3, 
  X,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface Props {
  showToast: (message: string, type: "success" | "error") => void;
  isHiddenFromSidebar?: boolean;
  onToggleSidebarVisibility?: () => void;
}

export default function LinkCloakerAdmin({ showToast, isHiddenFromSidebar, onToggleSidebarVisibility }: Props) {
  const [links, setLinks] = useState<CloakedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form states
  const [originalUrl, setOriginalUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLink, setEditingLink] = useState<CloakedLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CloakedLink | null>(null);

  const baseUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/l/` 
    : "https://editorshubstore.in/l/";

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const data = await getCloakedLinks();
      setLinks(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load cloaked links", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const generateRandomSlug = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSlug(result);
  };

  const handleSlugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      showToast("Please provide a destination URL", "error");
      return;
    }

    let finalSlug = slug.trim() ? handleSlugify(slug) : "";
    if (!finalSlug) {
      if (title.trim()) {
        finalSlug = handleSlugify(title);
      } else {
        const chars = "abcdefghjkmnpqrstuvwxyz23456789";
        for (let i = 0; i < 6; i++) {
          finalSlug += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
    }

    setIsSubmitting(true);
    const result = await saveCloakedLink({
      slug: finalSlug,
      originalUrl: originalUrl.trim(),
      title: title.trim() || finalSlug
    });
    setIsSubmitting(false);

    if (result.success) {
      showToast(editingLink ? "Link updated successfully!" : "Cloaked link created!", "success");
      setOriginalUrl("");
      setSlug("");
      setTitle("");
      setEditingLink(null);
      fetchLinks();
    } else {
      showToast(result.error || "Failed to save link", "error");
    }
  };

  const handleEditClick = (link: CloakedLink) => {
    setEditingLink(link);
    setSlug(link.slug);
    setOriginalUrl(link.originalUrl);
    setTitle(link.title || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingLink(null);
    setSlug("");
    setOriginalUrl("");
    setTitle("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteCloakedLink(deleteTarget.slug);
    if (result.success) {
      showToast(`Link "${deleteTarget.slug}" deleted`, "success");
      setDeleteTarget(null);
      fetchLinks();
    } else {
      showToast(result.error || "Failed to delete link", "error");
    }
  };

  const copyToClipboard = (slugToCopy: string) => {
    const fullUrl = `${baseUrl}${slugToCopy}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedSlug(slugToCopy);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  const filteredLinks = links.filter((l) => {
    const query = searchQuery.toLowerCase();
    return (
      l.slug.toLowerCase().includes(query) ||
      (l.title && l.title.toLowerCase().includes(query)) ||
      l.originalUrl.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Tips Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-brand-dark text-base">Inbox Protection with Domain Link Cloaker</h3>
              <p className="text-brand-dark/70 text-sm mt-1 leading-relaxed">
                When emails contain raw external links (like <code>mega.nz</code> or <code>*.vercel.app</code>), Gmail's anti-phishing filters often send them to Spam. 
                Cloaking your links routes them through <strong>{baseUrl.replace(/\/l\/$/, '')}</strong> so 100% of your email links match your verified domain.
              </p>
            </div>
          </div>

          {onToggleSidebarVisibility && (
            <button
              onClick={onToggleSidebarVisibility}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isHiddenFromSidebar
                  ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                  : "bg-white/80 hover:bg-white text-brand-dark/70 hover:text-brand-dark border-brand-dark/10 shadow-sm"
              }`}
            >
              {isHiddenFromSidebar ? (
                <>
                  <Eye className="w-4 h-4 text-amber-700" />
                  <span>Hidden from Sidebar (Click to Show)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-brand-dark/50" />
                  <span>Hide from Sidebar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Creator Form */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-dark/5">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-brand-primary" />
            <h2 className="font-bold text-lg text-brand-dark">
              {editingLink ? `Edit Cloaked Link (/l/${editingLink.slug})` : "Create New Cloaked Link"}
            </h2>
          </div>
          {editingLink && (
            <button
              onClick={cancelEdit}
              className="text-xs text-brand-dark/60 hover:text-brand-dark flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-dark/5"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title / Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-dark/70 mb-1.5">
                Link Title / Label
              </label>
              <input
                type="text"
                placeholder="e.g. Adobe Illustrator 2020 Mega Link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm transition-all"
              />
            </div>

            {/* Custom Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                  Custom Slug / Path
                </label>
                <button
                  type="button"
                  onClick={generateRandomSlug}
                  className="text-xs text-brand-primary hover:text-brand-primary/80 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-brand-dark/10 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary overflow-hidden bg-white">
                <span className="bg-brand-dark/5 px-3 py-2.5 text-xs font-mono text-brand-dark/60 select-none border-r border-brand-dark/10">
                  /l/
                </span>
                <input
                  type="text"
                  placeholder="ai-2020"
                  value={slug}
                  disabled={!!editingLink}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-mono outline-none disabled:bg-brand-dark/5 disabled:text-brand-dark/50"
                />
              </div>
            </div>
          </div>

          {/* Original Destination URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-dark/70 mb-1.5">
              Destination URL (External Link) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="https://mega.nz/file/... or https://aniketvisuals.vercel.app/ or Google Drive"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm font-mono transition-all"
            />
          </div>

          {/* Live Preview & Submit */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-brand-dark/5">
            <div className="text-xs text-brand-dark/70">
              <span className="font-semibold text-brand-dark">Generated Link: </span>
              <span className="font-mono text-brand-primary font-bold">
                {baseUrl}{slug ? handleSlugify(slug) : title ? handleSlugify(title) : "your-slug"}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : editingLink ? (
                <>
                  <Check className="w-4 h-4" /> Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create Cloaked Link
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Links List Header & Filter */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-dark/5">
          <div>
            <h2 className="font-bold text-lg text-brand-dark flex items-center gap-2">
              All Cloaked Links
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-dark/5 text-brand-dark/70 font-mono">
                {links.length}
              </span>
            </h2>
            <p className="text-xs text-brand-dark/60 mt-0.5">
              Copy and paste these links in your order approval emails and product descriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40" />
              <input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-brand-dark/10 focus:border-brand-primary outline-none w-56 transition-all"
              />
            </div>
            <button
              onClick={fetchLinks}
              disabled={loading}
              title="Refresh links"
              className="p-2 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark/70 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Links Table */}
        {loading ? (
          <div className="py-12 text-center text-brand-dark/50">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
            <p className="text-sm">Loading cloaked links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="py-12 text-center text-brand-dark/50">
            <LinkIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-brand-dark">No cloaked links found</p>
            <p className="text-xs mt-1">Create your first link above to protect your emails from spam filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-dark/5 text-xs uppercase tracking-wider text-brand-dark/50 font-semibold">
                  <th className="pb-3 px-3">Title & Slug</th>
                  <th className="pb-3 px-3">Cloaked Link</th>
                  <th className="pb-3 px-3">Original Destination</th>
                  <th className="pb-3 px-3 text-center">Clicks</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5 text-sm">
                {filteredLinks.map((item) => (
                  <tr key={item.slug} className="hover:bg-brand-dark/[0.02] transition-colors">
                    {/* Title & Slug */}
                    <td className="py-4 px-3 align-top">
                      <div className="font-semibold text-brand-dark">
                        {item.title || item.slug}
                      </div>
                      <div className="text-xs text-brand-dark/50 font-mono mt-0.5">
                        slug: {item.slug}
                      </div>
                    </td>

                    {/* Cloaked Link */}
                    <td className="py-4 px-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md max-w-[220px] truncate">
                          {baseUrl}{item.slug}
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.slug)}
                          className="p-1.5 rounded-lg border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark/70 hover:text-brand-dark transition-colors"
                          title="Copy Cloaked Link"
                        >
                          {copiedSlug === item.slug ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`/l/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark/70 hover:text-brand-dark transition-colors"
                          title="Test Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    {/* Destination URL */}
                    <td className="py-4 px-3 align-top max-w-[250px]">
                      <div className="truncate font-mono text-xs text-brand-dark/70" title={item.originalUrl}>
                        {item.originalUrl}
                      </div>
                      <span className="inline-block text-[11px] text-brand-dark/40 mt-0.5">
                        Created {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Clicks */}
                    <td className="py-4 px-3 align-top text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold font-mono">
                        <BarChart2 className="w-3 h-3" />
                        {item.clicks || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 rounded-lg hover:bg-brand-dark/5 text-brand-dark/60 hover:text-brand-dark transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-brand-dark/10">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-center text-lg text-brand-dark mb-1">
              Delete Cloaked Link?
            </h3>
            <p className="text-center text-brand-dark/70 text-xs mb-6">
              Are you sure you want to delete <strong className="font-mono text-brand-dark">/l/{deleteTarget.slug}</strong>? Any existing emails using this link will stop working.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-brand-dark/10 text-brand-dark text-xs font-semibold hover:bg-brand-dark/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
