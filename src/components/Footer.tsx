import React from "react";
import { Instagram, Linkedin, Youtube, ArrowUp } from "lucide-react";

interface FooterProps {
  scrollToSection: (id: string) => void;
}

export default function Footer({
  scrollToSection,
}: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-black/5 text-[#111111] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-12 lg:gap-8 text-left text-sm relative">
        
        {/* Brand details column */}
        <div className="space-y-6">
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center space-x-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0 relative overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100">
              <img
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png"
                alt="Editors Hub Logo"
                className="w-full h-full object-cover origin-center scale-[1.2]"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-bold text-lg text-black tracking-tight">
              Editors Hub Store
            </span>
          </button>
          
          <p className="text-sm text-gray-500 leading-relaxed font-sans max-w-xs pr-4">
            Get access to all my editing assets, plugins, sound effects, and
            creative tools in one place.
          </p>
          
          <div className="flex items-center space-x-3 text-black">
            <a
              href="https://x.com/Ankitxed"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="X Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/aniket_visuals/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="Instagram Handle"
            >
              <Instagram className="w-5 h-5 stroke-[1.8]" />
            </a>
            <a
              href="https://youtube.com/@aniket_visuals?si=wC2Z8R1CwMmjPLPV"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="YouTube Channel"
            >
              <Youtube className="w-5 h-5 stroke-[1.8]" />
            </a>
            <a
              href="https://www.linkedin.com/in/aniketvisuals/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4 stroke-[1.8] fill-current" />
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div className="space-y-5 text-left md:pl-4">
          <h4 className="font-display font-extrabold text-[15px] text-black">
            Company
          </h4>
          <ul className="space-y-4 font-sans font-medium text-[15px]">
            <li>
              <a href="/about" className="text-gray-500 hover:text-[#F97316] transition-colors block">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="text-gray-500 hover:text-[#F97316] transition-colors block">
                Contact
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-gray-500 hover:text-[#F97316] transition-colors block">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/refund" className="text-gray-500 hover:text-[#F97316] transition-colors block">
                Refund Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-gray-500 hover:text-[#F97316] transition-colors block">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="space-y-5 text-left md:pl-4">
          <h4 className="font-display font-extrabold text-[15px] text-black">
            Socials
          </h4>
          <ul className="space-y-4 font-sans font-medium text-[15px]">
            <li>
              <a
                href="https://discord.gg/sxGeT4SCBD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#F97316] transition-colors block"
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/aniket_visuals/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#F97316] transition-colors block"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://x.com/Ankitxed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#F97316] transition-colors block"
              >
                X (Twitter)
              </a>
            </li>
          </ul>
        </div>
        
        {/* Map & Graphics Column */}
        <div className="relative h-[200px] md:h-auto block">
           <div className="absolute inset-0 bg-contain bg-no-repeat bg-right-top opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')" }}></div>
           {/* Mock map dots */}
           <div className="absolute top-[30%] right-[35%] w-2 h-2 bg-[#F97316] rounded-sm rotate-45 pointer-events-none"></div>
           <div className="absolute top-[15%] right-[10%] w-2 h-2 bg-[#F97316] rounded-sm rotate-45 pointer-events-none"></div>
           
           <div className="absolute bottom-4 right-0 flex flex-col items-end rotate-[-8deg]">
              <span className="font-handwriting text-[28px] text-black leading-[1.1] text-right">
                Creators<br/>Everywhere
              </span>
              <svg width="100" height="15" viewBox="0 0 100 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
                 <path d="M5 10C35 5 65 5 95 2" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
              </svg>
           </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black/5 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-gray-500 font-medium">
          <div className="flex-1 text-center sm:text-left">
            © {new Date().getFullYear()} Editors Hub Store. All Rights Reserved.
          </div>
          
          <div className="flex-1 flex justify-center items-center gap-1.5">
            <span className="text-[#F97316]">🧡</span> Designed & Developed by Aniket Visuals.
          </div>
          
          <div className="flex-1 flex justify-center sm:justify-end">
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 text-black font-semibold hover:text-[#F97316] transition-colors"
            >
              Back to top <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
