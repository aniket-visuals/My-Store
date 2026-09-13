import React from "react";
import { motion } from "motion/react";
import { Box } from "lucide-react";

export default function Hero() {
  // Asset Cards floating motion configuration
  const floatingAnimation = (delay: number, yOffset: number = -12) => ({
    y: [0, yOffset, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
      delay: delay,
    },
  });

  return (
    <section id="hero" className="relative flex flex-col justify-center items-center overflow-hidden bg-[#FFFFFF] pt-8 pb-24 lg:pt-12 lg:pb-32">
      
      {/* Soft warm background gradients matching the image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
        {/* Subtle diffuse peach glow */}
        <div className="w-[80vw] max-w-[1200px] h-[400px] rounded-full bg-[#FFEDD5] blur-[120px] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col items-center">
        
        {/* Top Graphic Composition Area */}
        <div className="relative w-full max-w-5xl mb-2 sm:mb-6 flex items-center justify-center">
          
          {/* Main Hero Product Image Wrapper */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-[520px] sm:max-w-[780px] md:max-w-[960px] flex items-center justify-center z-10"
          >
            <img 
              src="https://res.cloudinary.com/df5rgwdng/image/upload/v1789231856/4693e201-03d3-4cf3-82c1-4fb429b628f4_utme36.png" 
              alt="Motion Essentials and Creator Toolkit Boxes" 
              className="w-full h-auto object-contain z-10 relative mix-blend-multiply scale-[1.02]"
              style={{ maskImage: 'radial-gradient(ellipse 45% 45% at 50% 50%, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 45% 45% at 50% 50%, black 70%, transparent 100%)' }}
              referrerPolicy="no-referrer"
            />

            {/* Floating Pill Cards */}
            
            {/* After Effects */}
            <motion.div animate={floatingAnimation(0)} className="absolute top-[12%] -left-[2%] sm:left-[2%] lg:-left-[2%] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-lg lg:rounded-2xl p-1.5 sm:p-2 lg:p-2.5 pr-3 sm:pr-4 lg:pr-5 hidden sm:flex items-center gap-2 lg:gap-3 border border-gray-100 z-20">
              <div className="w-7 h-7 sm:w-7 sm:h-7 lg:w-9 lg:h-9 bg-[#00005B] rounded-md flex items-center justify-center text-[#D2ACFF] font-bold text-xs tracking-tight font-sans">
                Ae
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] sm:text-[11px] lg:text-[13px] font-bold text-black leading-tight">After Effects</span>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#71717A] font-medium">Scripts & Plugins</span>
              </div>
            </motion.div>

            {/* Premiere Pro */}
            <motion.div animate={floatingAnimation(1.5, -8)} className="absolute bottom-[25%] -left-[5%] sm:left-[6%] lg:-left-[5%] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-lg lg:rounded-2xl p-1.5 sm:p-2 lg:p-2.5 pr-3 sm:pr-4 lg:pr-5 hidden sm:flex items-center gap-2 lg:gap-3 border border-gray-100 z-20">
              <div className="w-7 h-7 sm:w-7 sm:h-7 lg:w-9 lg:h-9 bg-[#00005B] rounded-md flex items-center justify-center text-[#EA77FF] font-bold text-xs tracking-tight font-sans">
                Pr
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] sm:text-[11px] lg:text-[13px] font-bold text-black leading-tight">Premiere Pro</span>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#71717A] font-medium">Templates</span>
              </div>
            </motion.div>

            {/* DaVinci Resolve */}
            <motion.div animate={floatingAnimation(0.8, -10)} className="absolute top-[25%] -right-[2%] sm:right-[2%] lg:-right-[2%] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-lg lg:rounded-2xl p-1.5 sm:p-2 lg:p-2.5 pr-3 sm:pr-4 lg:pr-5 hidden sm:flex items-center gap-2 lg:gap-3 border border-gray-100 z-20">
              <div className="w-7 h-7 sm:w-7 sm:h-7 lg:w-9 lg:h-9 bg-[#0C1220] rounded-md flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner border border-black/10">
                {/* DaVinci Resolve SVG Logo */}
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="absolute drop-shadow-md w-5 h-5 lg:w-6 lg:h-6">
                   {/* Top Blue Teardrop */}
                   <path fill="#00C4FF" d="M50 15 C62 30, 68 45, 50 55 C32 45, 38 30, 50 15 Z" />
                   {/* Bottom Left Green Teardrop */}
                   <path fill="#9DFF00" d="M25 65 C40 55, 55 58, 48 78 C41 98, 15 80, 25 65 Z" />
                   {/* Bottom Right Pink/Red Teardrop */}
                   <path fill="#FF2A5F" d="M75 65 C60 55, 45 58, 52 78 C59 98, 85 80, 75 65 Z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] sm:text-[11px] lg:text-[13px] font-bold text-black leading-tight">DaVinci Resolve</span>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#71717A] font-medium">LUTs & Presets</span>
              </div>
            </motion.div>

            {/* 3D Assets */}
            <motion.div animate={floatingAnimation(2.2)} className="absolute bottom-[20%] -right-[5%] sm:right-[6%] lg:-right-[5%] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-lg lg:rounded-2xl p-1.5 sm:p-2 lg:p-2.5 pr-3 sm:pr-4 lg:pr-5 hidden sm:flex items-center gap-2 lg:gap-3 border border-gray-100 z-20">
              <div className="w-7 h-7 sm:w-7 sm:h-7 lg:w-9 lg:h-9 bg-[#F97316] rounded-md flex items-center justify-center text-white">
                <Box className="w-3 h-3 lg:w-4 lg:h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] sm:text-[11px] lg:text-[13px] font-bold text-black leading-tight">3D Assets</span>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#71717A] font-medium">For Creators</span>
              </div>
            </motion.div>

            {/* Handwriting Text & Arrow */}
            <motion.div 
              animate={floatingAnimation(1, -6)}
              className="absolute -top-[2%] right-[10%] sm:top-[4%] sm:-right-[0%] lg:right-[6%] hidden md:flex flex-col items-center z-10 -rotate-[8deg]"
            >
              <span className="font-handwriting text-[26px] sm:text-[30px] leading-[1.1] text-[#F97316] font-bold text-center -mr-4">
                Tools<br/>That Move<br/>Ideas
              </span>
              <svg width="42" height="38" viewBox="0 0 42 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2 ml-4">
                <path d="M2.5 35.5C8 30.5 18.5 24.5 26.5 28.5C31.7915 31.1458 35.8078 35.8453 38.5 4" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M31 3.5L38.8687 4L37.5 12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>

          </motion.div>
        </div>

        {/* Text and Actions Section */}
        <div className="text-center relative z-20 max-w-[800px] w-full flex flex-col items-center">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-[#F97316] font-bold tracking-[0.15em] text-xs sm:text-sm uppercase mb-4 sm:mb-5"
          >
            Creative Toolkit
          </motion.h3>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-[#000000] tracking-tight mb-5 sm:mb-7 leading-[1.1]"
          >
            Built for Creative Work
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[17px] sm:text-[20px] text-[#71717A] max-w-[550px] mx-auto font-medium leading-relaxed"
          >
            Scripts, presets, templates, and plugins — everything integrated.
          </motion.p>
        </div>
        
      </div>
    </section>
  );
}
