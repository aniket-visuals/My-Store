import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Sparkles, FolderOpen, Video, Palette, Code, X, ChevronRight, Sliders, Volume2, Film } from "lucide-react";

interface HeroProps {
  onExploreClick: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [colorSplit, setColorSplit] = useState(45); // Percentage for Before/After LUT slider

  // Asset Cards floating motion configuration
  const floatingAnimation = (delay: number) => ({
    y: [0, -12, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
      delay: delay,
    },
  });

  return (
    <section id="hero" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center py-16 xl:py-24 overflow-hidden bg-brand-bg">
      {/* Background radial soft light gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] rounded-full bg-brand-primary/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-primary/5 blur-[100px]" />
        
        {/* Fine background grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center relative z-10 w-full">
        
        {/* Left Side: Typography and CTAs */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-8">
          
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-black/5 hover:bg-black/10 transition-colors px-4 py-1.5 rounded-full border border-black/5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-tight text-black flex items-center">
              ANIKET VISUALS 2.0 • NEW LUT STOCKS REMASTERED
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-black tracking-tight leading-[1.08]"
          >
            Create Better <br />
            <span className="relative inline-block text-black">
              Videos Faster
              <span className="absolute bottom-1 left-0 w-full h-[5px] bg-brand-primary/25 rounded-full" />
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-black/60 font-sans text-base sm:text-lg leading-relaxed max-w-xl"
          >
            Professional editing assets, templates, presets, sound effects, and creative resources designed for modern creators. Take full control of your sequence timeline.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <button
               onClick={onExploreClick}
              className="bg-brand-primary text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-brand-accent hover:translate-y-[-2px] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Explore Assets</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </motion.div>



        </div>

        {/* Right Side: 3D-feeling Creative Assets Canvas Mockup */}
        <div className="lg:col-span-6 relative w-full aspect-square min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
          
          {/* Main Simulated NLE Workspace Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-[90%] h-[90%] bg-white rounded-3xl border border-black/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl flex flex-col p-4"
          >
            {/* Window bar controls */}
            <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3 shrink-0">
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/[0.08]" />
              </div>
              <div className="text-[10px] font-mono text-black/40 font-semibold uppercase tracking-wider">
                Resolve Workspace Layout
              </div>
              <div className="w-12 h-1.5 rounded bg-black/5" />
            </div>

            {/* Simulated Color Grade Area / Compare LUT split */}
            <div className="relative flex-1 rounded-2xl overflow-hidden group/split border border-black/5 bg-black">
              {/* BEFORE Side / Underlay (Right side when sliding to left) */}
              <img
                src="https://res.cloudinary.com/df5rgwdng/image/upload/v1780627894/Untitled_design_4_bryqyd.png"
                alt="Slow manual editing visual comparison"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* AFTER Side / Overlay (Left side) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${colorSplit}%` }}
              >
                <div className="absolute inset-0 w-full h-full min-w-[360px] lg:min-w-[500px]">
                  <img
                    src="https://res.cloudinary.com/df5rgwdng/image/upload/v1780627872/Untitled_design_3_xq7rgr.png"
                    alt="Fast automated/creative editing design assets"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Slider Controller divider line */}
              <div
                className="absolute inset-y-0 w-1 bg-brand-primary cursor-ew-resize flex items-center justify-center pointer-events-none"
                style={{ left: `${colorSplit}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-white text-brand-primary shadow-md border border-brand-primary/20 flex items-center justify-center text-[10px] font-mono scale-95 select-none font-bold">
                  ↔
                </div>
              </div>

              {/* Slider Input overlay overlay click area */}
              <input
                type="range"
                min="0"
                max="100"
                value={colorSplit}
                onChange={(e) => setColorSplit(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-20"
              />

              {/* Slider overlays tags */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-mono text-emerald-400 z-20 select-none font-bold">
                AFTER (100%)
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-mono text-red-400 z-20 select-none font-bold">
                BEFORE (0%)
              </div>
            </div>

            {/* Interactive Timeline Layer Simulator */}
            <div className="mt-4 pt-3 border-t border-black/5 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-black/50 font-mono">
                <span>01:42:04 / COMPLETE RENDER</span>
                <span>SYSTEM SPEED: 100% OK</span>
              </div>
              
              <div className="grid grid-cols-12 gap-1.5 h-7">
                {/* Visual Layers bar */}
                <div className="col-span-1 bg-brand-primary/15 rounded flex items-center justify-center text-[8px] font-mono text-brand-primary font-bold">V2</div>
                <div className="col-span-6 bg-brand-accent/15 border-l-2 border-brand-accent rounded p-1 flex items-center space-x-1.5 justify-start text-[8px] font-mono text-brand-accent truncate">
                  <Film className="w-2.5 h-2.5" />
                  <span>C_Abberation_Template.mogrt</span>
                </div>
                <div className="col-span-5 bg-brand-primary/15 border-l-2 border-brand-primary rounded p-1 flex items-center space-x-1.5 justify-start text-[8px] font-mono text-brand-primary truncate">
                  <Palette className="w-2.5 h-2.5" />
                  <span>Helios_TealOrange_C12.cube</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-1.5 h-7">
                {/* Audio Layers bar */}
                <div className="col-span-1 bg-brand-primary/15 rounded flex items-center justify-center text-[8px] font-mono text-brand-primary font-bold">A1</div>
                <div className="col-span-8 bg-brand-primary/15 border-l-2 border-brand-primary rounded p-1 flex items-center space-x-1.5 justify-between text-[8px] font-mono text-brand-primary">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Volume2 className="w-2.5 h-2.5" />
                    <span>Aether_Atmo_Impact_High.wav</span>
                  </div>
                  {/* Miniature Audio Waveform bar lines */}
                  <div className="flex items-end space-x-0.5 h-3">
                    <div className="w-[1.5px] h-3 bg-brand-primary/60 rounded" />
                    <div className="w-[1.5px] h-2.5 bg-brand-primary/60 rounded" />
                    <div className="w-[1.5px] h-1.5 bg-brand-primary/50 rounded" />
                    <div className="w-[1.5px] h-3 bg-brand-primary/80 rounded" />
                    <div className="w-[1.5px] h-2 bg-brand-primary/30 rounded" />
                  </div>
                </div>
                <div className="col-span-3 bg-black/5 rounded group flex items-center justify-center text-[8px] font-mono text-black/40">
                  <span>+ Add Track</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FLOATING INGREDIENTS/CARDS OVERLAY */}

          {/* Card A: Color grading LUT info box */}
          <motion.div
            animate={floatingAnimation(0)}
            className="absolute top-[8%] -right-[4%] bg-white border border-black/5 shadow-xl p-3.5 rounded-2xl flex items-center space-x-3.5 max-w-[190px] z-30"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-primary/15 flex items-center justify-center text-brand-primary">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-black leading-tight">LUT Applied</p>
              <p className="text-[10px] font-mono text-black/50 mt-0.5">Helios Cine-Grade</p>
            </div>
          </motion.div>

          {/* Card B: Sound design waveform preview card */}
          <motion.div
            animate={floatingAnimation(1.4)}
            className="absolute bottom-[16%] -left-[4%] bg-white border border-black/5 shadow-xl p-3.5 rounded-2xl flex items-center space-x-3.5 max-w-[200px] z-30"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-accent/15 flex items-center justify-center text-brand-accent">
              <Volume2 className="w-4 h-4 animate-bounce" style={{ animationDuration: "1.2s" }} />
            </div>
            <div>
              <p className="text-xs font-bold text-black leading-tight">Aether SFX Pack.</p>
              <p className="text-[10px] font-mono text-black/50 mt-0.5">8D Cinematic.wav</p>
            </div>
          </motion.div>

          {/* Card C: Tech specifications HUD */}
          <motion.div
            animate={floatingAnimation(2.8)}
            className="absolute -bottom-[2%] right-[10%] bg-black text-brand-bg py-2 px-3.5 rounded-xl flex items-center space-x-2.5 z-30 shadow-lg text-[9px] font-mono uppercase tracking-widest border border-white/5"
          >
            <Video className="w-3.5 h-3.5 text-brand-primary stroke-[2.5]" />
            <span>RENDER CONTEXT: 4K HIGH DEPTH</span>
          </motion.div>

        </div>

      </div>

      {/* WATCH PREVIEW VIDEO MODAL SCREEN */}
      <AnimatePresence>
        {isPlayingPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlayingPreview(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden aspect-video shadow-2xl border border-white/10 z-10"
            >
              <button
                onClick={() => setIsPlayingPreview(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <iframe
                src="https://player.vimeo.com/video/510321287?autoplay=1&muted=0&loop=1&background=0"
                title="Commercial Video Montage Reel"
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />

              <div className="absolute bottom-4 left-6 z-20 bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 max-w-sm hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">Editors Raj Cinema Reel</p>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">Asset overlays, sound beds, film textures, and LUTs in combination view.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
