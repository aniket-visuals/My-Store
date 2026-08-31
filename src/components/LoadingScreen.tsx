import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingScreen({ 
  fullScreen = false, 
  message = "Loading professional assets..." 
}: LoadingScreenProps) {
  const containerClass = fullScreen 
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-bg/95 backdrop-blur-sm"
    : "min-h-[60vh] flex flex-col items-center justify-center w-full";

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-8">
          {/* Spinner Container */}
          <div className="w-20 h-20 bg-white shadow-xl shadow-brand-primary/10 rounded-2xl flex items-center justify-center relative z-10 border border-brand-dark/5">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
          </div>
          
          {/* Animated decorative rings */}
          <motion.div 
            className="absolute inset-0 bg-brand-primary/20 rounded-2xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute inset-0 bg-brand-primary/10 rounded-2xl"
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
        </div>
        
        <motion.h2 
          className="font-display font-bold text-2xl text-brand-dark tracking-tight mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Editors Hub
        </motion.h2>
        
        {message && (
          <p className="text-sm font-medium text-brand-dark/60">
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
