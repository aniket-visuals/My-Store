import React from "react";
import { Instagram, Linkedin, Youtube } from "lucide-react";

interface FooterProps {
  scrollToSection: (id: string) => void;
  setActiveCategory: (category: string) => void;
}

export default function Footer({ scrollToSection, setActiveCategory }: FooterProps) {
  return (
    <footer className="bg-white border-t border-black/5 text-[#111111] overflow-hidden">
      
      {/* 2. Structured Sitemap navigation directories */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-sm">
        
        {/* Brand details column */}
        <div className="md:col-span-2 space-y-6">
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center space-x-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0 relative overflow-hidden rounded-lg">
              <img 
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1773434133/looooo_y1n4b3.png"
                alt="Editors Hub Logo"
                className="w-full h-full object-cover origin-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-bold text-base text-black tracking-tight">
              Editors Hub
            </span>
          </button>
          
          <p className="text-xs text-black/50 leading-relaxed font-sans max-w-sm">
            Get access to all my editing assets, plugins, sound effects, and creative tools in one place.<br /><br />Don't forget to follow our social pages to stay updated with the latest releases, updates, and exclusive content.
          </p>
 
          <div className="flex items-center space-x-3.5 text-black/55 select-none">
            <a href="https://x.com/Ankitxed" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="X Profile">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/aniket_visuals/" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="Instagram Handle">
              <Instagram className="w-4.5 h-4.5 stroke-[1.8]" />
            </a>
            <a href="https://youtube.com/@aniket_visuals?si=wC2Z8R1CwMmjPLPV" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="YouTube Channel">
              <Youtube className="w-4.5 h-4.5 stroke-[1.8]" />
            </a>
            <a href="https://www.linkedin.com/in/aniketvisuals/" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" title="LinkedIn Profile">
              <Linkedin className="w-4.5 h-4.5 stroke-[1.8]" />
            </a>
          </div>
        </div>
 
        {/* Extra links column */}
        <div className="space-y-4 md:col-span-1 md:justify-self-end text-left">
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-black/40">Extra links</h4>
          <ul className="space-y-2.5 font-sans font-semibold">
            <li>
              <a href="https://discord.gg/sxGeT4SCBD" target="_blank" rel="noreferrer" className="text-black/65 hover:text-brand-primary transition-colors">
                Discord
              </a>
            </li>
            <li>
              <a href="https://t.me/aniketvisuals" target="_blank" rel="noreferrer" className="text-black/65 hover:text-brand-primary transition-colors">
                Telegram
              </a>
            </li>
            <li>
              <a href="#about-us" className="text-black/65 hover:text-brand-primary transition-colors">
                About Us
              </a>
            </li>
          </ul>
        </div>
 
        {/* Contact column */}
        <div className="space-y-4 md:col-span-1 md:justify-self-end text-left">
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-black/40">Contact</h4>
          <ul className="space-y-2.5 font-sans font-semibold">
            <li>
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=aniketrajcargal123@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-black/65 hover:text-brand-primary transition-colors break-all"
              >
                aniketrajcargal123@gmail.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* 3. Bottom Legal License Copyright notification */}
      <div className="border-t border-black/5 bg-brand-bg/50 py-8 text-xs text-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <span>
            © 2026 Editors Hub Store. All Rights Reserved. Designed & Developed by Aniket Visuals.
          </span>

          {/* Links removed */}

        </div>
      </div>

    </footer>
  );
}
