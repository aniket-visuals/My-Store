import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Check, Twitter, Instagram, Youtube, Github, Inbox, Linkedin } from "lucide-react";
import { CATEGORIES_DATA } from "../data";

interface FooterProps {
  scrollToSection: (id: string) => void;
  setActiveCategory: (category: string) => void;
}

export default function Footer({ scrollToSection, setActiveCategory }: FooterProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 1200);
  };

  return (
    <footer className="bg-white border-t border-black/5 text-[#111111] overflow-hidden">
      
      {/* 2. Structured Sitemap navigation directories */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-sm">
        
        {/* Brand details column */}
        <div className="md:col-span-2 space-y-6">
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center space-x-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0 relative overflow-hidden rounded-lg">
              <img 
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1773434133/looooo_y1n4b3.png"
                alt="Editors Raj Logo"
                className="w-full h-full object-cover origin-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-bold text-base text-black tracking-tight">
              Editors Raj
            </span>
          </button>
          
          <p className="text-xs text-black/50 leading-relaxed font-sans max-w-sm">
            Professional workflow expanders, preset systems, cinematic color grading variables, and organic audio beds recorded meticulously for elite content creators worldwide.
          </p>

          <div className="flex items-center space-x-3.5 text-black/55 select-none">
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="X Profile">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="Instagram Handle">
              <Instagram className="w-4.5 h-4.5 stroke-[1.8]" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="YouTube Channel">
              <Youtube className="w-4.5 h-4.5 stroke-[1.8]" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="LinkedIn Profile">
              <Linkedin className="w-4.5 h-4.5 stroke-[1.8]" />
            </a>
          </div>
        </div>

        {/* Resources direct list */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-brand-primary">Help Desk</h4>
          <ul className="space-y-2.5 font-sans font-medium text-black/65">
            <li>
              <button onClick={() => scrollToSection("faq")} className="hover:text-black cursor-pointer">
                Accordion FAQ
              </button>
            </li>
            <li>
              <a href="mailto:support@editorsraj.com" className="hover:text-black">
                Email Support
              </a>
            </li>
            <li>
              <a href="#discord" className="hover:text-black">
                Discord Team
              </a>
            </li>
            <li>
              <a href="#licensing" className="hover:text-black">
                License Terms
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* 3. Bottom Legal License Copyright notification */}
      <div className="border-t border-black/5 bg-brand-bg/50 py-8 text-xs text-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <span>
            © {new Date().getFullYear()} Editors Raj. Handcrafted with pixel perfection. All licensing cleared under global law.
          </span>

          <div className="flex items-center space-x-6 font-medium">
            <a href="#terms" className="hover:text-black transition-colors">Licensing Terms</a>
            <a href="#privacy" className="hover:text-black transition-colors">Privacy Principles</a>
            <a href="#cookies" className="hover:text-black transition-colors">Cookies Config</a>
          </div>

        </div>
      </div>

    </footer>
  );
}
