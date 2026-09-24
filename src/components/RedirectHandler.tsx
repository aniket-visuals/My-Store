import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCloakedLink, recordLinkClick } from "../services/linkService";
import { ExternalLink, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function RedirectHandler() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("No redirect identifier specified.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function handleRedirect() {
      try {
        const link = await getCloakedLink(slug!);
        if (!isMounted) return;

        if (link && link.originalUrl) {
          setTargetUrl(link.originalUrl);
          setTitle(link.title || link.slug);

          // Record click count in the background
          recordLinkClick(slug!).catch(() => {});

          // Small delay (250ms) to ensure smooth transition and allow browser to register
          setTimeout(() => {
            if (isMounted) {
              window.location.replace(link.originalUrl);
            }
          }, 350);
        } else {
          setError("The requested link does not exist or has expired.");
          setLoading(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Redirect error:", err);
        setError("Unable to process redirect at this time.");
        setLoading(false);
      }
    }

    handleRedirect();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#18181b] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2 text-white">Link Not Found</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            Go to Editors Hub Store
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#18181b] border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 mb-3">
            Secure Link Verification
          </span>

          <h2 className="text-2xl font-bold font-display mb-2 text-white">
            {title ? title : "Editors Hub Store"}
          </h2>

          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Redirecting you to your destination...
          </p>

          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce"></div>
          </div>

          {targetUrl && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-zinc-500 mb-3">
                If you are not redirected automatically in a few seconds:
              </p>
              <a
                href={targetUrl}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
              >
                Click here to continue
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
