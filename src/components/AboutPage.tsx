import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateMetaTags } from "../utils/seo";
import { ArrowLeft, Sparkles, Video, Play, Zap } from "lucide-react";
import Footer from "./Footer";

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    updateMetaTags({
      title: "About Us — Editors Hub Store",
      description: "Learn more about Editors Hub Store and our mission to provide the best digital assets for video editors and motion designers.",
      url: "https://www.editorshubstore.in/about"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-brand-dark/60 hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-24 w-full">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="space-y-6 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-xl mb-8 border border-black/10">
              <img
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png"
                alt="Editors Hub Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl text-brand-dark tracking-tight">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-primary/60">Creative Vision</span>
            </h1>
            <p className="text-xl text-brand-dark/60 leading-relaxed">
              We build professional-grade tools, templates, and assets to help video editors and motion designers create their best work faster.
            </p>
          </div>

          {/* Story Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display font-bold text-3xl text-brand-dark">Our Story</h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Editors Hub started as a small personal project by Aniket Visuals to share custom-made assets with fellow creators. What began as a simple resource library quickly grew into a comprehensive marketplace for high-end editing tools.
              </p>
              <p className="text-brand-dark/70 leading-relaxed">
                Today, we provide premium assets, plugins, sound effects, and project files to thousands of creators worldwide, helping them push the boundaries of their video productions.
              </p>
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-brand-dark/5 border border-brand-dark/10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent mix-blend-overlay"></div>
              {/* Using a placeholder or the logo as hero image */}
              <img
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png"
                alt="Editors Hub"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="space-y-8">
            <h2 className="font-display font-bold text-3xl text-brand-dark text-center">What We Stand For</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-brand-dark text-lg">Uncompromising Quality</h3>
                <p className="text-sm text-brand-dark/60 leading-relaxed">
                  Every asset is meticulously crafted, tested, and refined to meet industry standards.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-brand-dark text-lg">Workflow Efficiency</h3>
                <p className="text-sm text-brand-dark/60 leading-relaxed">
                  Our tools are designed to save you hours of work, letting you focus on the creative decisions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-brand-dark text-lg">Built for Creators</h3>
                <p className="text-sm text-brand-dark/60 leading-relaxed">
                  We are editors building for editors. We understand the pain points and craft solutions.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer scrollToSection={() => {}} setActiveCategory={() => {}} />
    </div>
  );
}
