import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Download, Radio, Volume2, VolumeX, Pocket, Cpu, ShoppingCart, Check, Info, ShieldAlert, Play } from "lucide-react";
import { Product } from "../types";

interface ProductPreviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  addToCart: (product: Product) => void;
  inCart: boolean;
}

export default function ProductPreviewModal({
  product,
  isOpen,
  onClose,
  addToCart,
  inCart
}: ProductPreviewModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto clean up or initialize audio node
  useEffect(() => {
    if (isOpen && product.audioPreview) {
      audioRef.current = new Audio(product.audioPreview);
      audioRef.current.volume = 0.5;

      const updateProgress = () => {
        if (audioRef.current) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }
      };

      const handleEnded = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      };

      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("ended", handleEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("timeupdate", updateProgress);
          audioRef.current.removeEventListener("ended", handleEnded);
        }
      };
    }
  }, [isOpen, product.audioPreview]);

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((err) => {
        console.error("Audio playback clearance failed:", err);
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Overlay drop shadow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Card body */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative bg-white rounded-3xl overflow-hidden border border-black/5 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col sm:flex-row z-10"
          >
            
            {/* Top Close indicator */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/65 hover:bg-black/90 text-[#F9FAF5] flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* LEFT BLOCK: Rich media showcase workspace */}
            <div className="w-full sm:w-1/2 aspect-video sm:aspect-auto sm:h-full min-h-[220px] sm:min-h-[500px] relative bg-black flex flex-col justify-between overflow-hidden">
              
              {product.videoPreview ? (
                // Video asset playback
                <video
                  src={product.videoPreview}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                // Static high resolution catalog background image
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
              )}

              {/* Gradient border edge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

              {/* Top metadata tags */}
              <div className="relative p-5 text-left">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-brand-primary">
                  DEVELOPER METRICS // ACTIVEPREVIEW
                </span>
              </div>

              {/* Bottom interactive player panel */}
              <div className="relative p-6 text-left space-y-4">
                
                {product.audioPreview && (
                  // Sound effects specific media deck control panel
                  <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Volume2 className="w-3.5 h-3.5 text-brand-primary" />
                        PREVIEW SOUND DESIGN WAVEFORM
                      </span>
                      <span>{Math.round(audioProgress)}% played</span>
                    </div>

                    {/* Waveform graphic simulator with dynamic loading timeline fill */}
                    <div className="flex items-end justify-between h-9 gap-1 cursor-pointer" onClick={toggleAudioPlayback}>
                      {[12, 18, 14, 24, 28, 16, 22, 32, 28, 20, 14, 26, 32, 18, 14, 22, 30, 16, 24, 18].map((val, index) => {
                        const isActive = (index / 20) * 100 <= audioProgress;
                        return (
                          <div
                            key={index}
                            className="flex-1 rounded"
                            style={{
                              height: `${val}%`,
                              backgroundColor: isActive ? "#FC7301" : "rgba(255, 255, 255, 0.15)",
                              transition: "background-color 0.1s"
                            }}
                          />
                        );
                      })}
                    </div>

                    <button
                      onClick={toggleAudioPlayback}
                      className="w-full bg-brand-bg text-black border border-black/10 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 flex items-center justify-center space-x-2"
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Pause Audio Preview</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-black text-black" />
                          <span>Play Audio Bed</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* File details tag */}
                <div className="flex flex-wrap gap-2.5">
                  <span className="text-[10px] font-mono bg-white/10 backdrop-blur-sm text-white px-2.5 py-1 rounded">
                    TYPE: {product.fileType}
                  </span>
                  <span className="text-[10px] font-mono bg-white/10 backdrop-blur-sm text-white px-2.5 py-1 rounded">
                    SIZE: {product.fileSize}
                  </span>
                </div>

              </div>

            </div>

            {/* RIGHT BLOCK: Specific item context panel */}
            <div className="w-full sm:w-1/2 p-8 sm:p-10 flex flex-col justify-between overflow-y-auto">
              
              <div className="space-y-6 text-left">
                
                {/* Meta details */}
                <div className="flex items-center justify-between text-xs font-mono font-bold text-black/40">
                  <span className="uppercase text-brand-primary">{product.category.replace("-", " ")}</span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-black/50" />
                    {product.downloadCount.toLocaleString()} DOWNLOADS
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl sm:text-2xl text-black leading-snug">
                  {product.name}
                </h3>

                <p className="text-sm text-black/60 font-sans leading-relaxed">
                  {product.description}
                </p>

                {/* Specifications tables block */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-black/5 font-sans">
                    <span className="text-black/45 font-medium">Software Compatibility:</span>
                    <span className="text-black font-semibold truncate max-w-[200px]">{product.compatibility}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-black/5 font-sans">
                    <span className="text-black/45 font-medium">Rating Profile:</span>
                    <span className="text-black font-bold flex items-center gap-1 font-mono">
                      <Star className="w-3.5 h-3.5 fill-brand-primary stroke-transparent inline" />
                      {product.rating} ({product.reviewsCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Bundle contents checklist */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-[10px] font-mono text-black/45 uppercase tracking-widest font-extrabold">
                    BUNDLE PACKAGE CONTAINS
                  </p>
                  
                  <div className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start text-xs font-medium text-black">
                        <div className="w-4.5 h-4.5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mr-2 mt-0.5 shrink-0 select-none">
                          ✓
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Final purchasing trigger bottom segment */}
              <div className="mt-8 pt-6 border-t border-black/5 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-black/40 font-bold uppercase select-none leading-none">PRICING STRUCTURE</p>
                    <div className="flex items-baseline mt-1 space-x-1.5">
                      <span className="font-display font-semibold text-2xl text-black leading-none">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-black/35 line-through font-mono font-bold leading-none">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded">
                    PERPETUAL COMMERCIAL UC
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => addToCart(product)}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center flex items-center justify-center space-x-2.5 ${
                      inCart
                        ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 animate-none"
                        : "bg-brand-primary text-white hover:bg-brand-accent"
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-5 h-5 stroke-[2.5]" />
                        <span>Item in Cart — View Drawer Checkout</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Buy & Download Instantly</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
