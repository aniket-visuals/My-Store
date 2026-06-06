import React from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { FEATURE_ITEMS, STATS_DATA } from "../data";

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center py-20 xl:py-28 bg-[#FFFFFF] border-t border-b border-black/5 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary/3 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-24">
        
        {/* Trusted By Section: Large Statistic counters */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-primary mb-2">
              Our Community
            </p>
            <h3 className="font-display font-semibold text-lg text-black/80">
              Empowering Creative Minds Worldwide
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS_DATA.map((stat, idx) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="text-center bg-white p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-colors"
              >
                <p className="font-display font-bold text-3xl sm:text-4xl text-black select-none tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-black font-sans mt-2.5">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us: 3-column Premium Features Grid Layout */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
            <div className="text-left max-w-2xl">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-primary mb-3">
                ANIKET VISUALS STANDARD
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark tracking-tight leading-tight">
                Designed for Editors.<br />Curated for Absolute Excellence.
              </h2>
            </div>
            <p className="text-sm text-brand-muted font-sans max-w-sm text-left leading-relaxed">
              Say goodbye to generic stock and licensing nightmares. Every resource in our store is personally selected, rigorously tested, and trusted in real high-pressure production environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURE_ITEMS.map((feature, idx) => {
              // Dynamically resolve Icon safely
              const IconComponent = (Icons as any)[feature.iconName] || Icons.Compass;

              // Customize top badges of trust and quality
              const getFeatureMeta = (id: string) => {
                switch (id) {
                  case "f1":
                    return { tag: "Aniket Visuals Curated", badgeColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/10" };
                  case "f2":
                    return { tag: "Exclusive Collection", badgeColor: "bg-brand-accent/10 text-brand-accent border-brand-accent/10" };
                  case "f3":
                    return { tag: "Rapid Support Channel", badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100" };
                  case "f4":
                    return { tag: "Consistently Maintained", badgeColor: "bg-sky-50 text-sky-600 border-sky-100" };
                  case "f5":
                    return { tag: "Client-Work Optimized", badgeColor: "bg-violet-50 text-violet-600 border-violet-100" };
                  case "f6":
                    return { tag: "As Seen On Livestream", badgeColor: "bg-rose-50 text-rose-600 border-rose-100" };
                  default:
                    return { tag: "Verified Quality", badgeColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/10" };
                }
              };

              const { tag, badgeColor } = getFeatureMeta(feature.id);

              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="bg-white border border-brand-muted/20 hover:border-brand-primary/30 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_48px_-12px_rgba(252,115,1,0.08)] transition-all duration-300 rounded-2xl p-8 text-left flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle top decoration */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-brand-primary transition-all duration-500" />
                  
                  <div className="space-y-6">
                    {/* Badge & Icon Row */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-brand-dark flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:scale-105 transition-all duration-300 shadow-md">
                        <IconComponent className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${badgeColor} select-none`}>
                        {tag}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-lg text-brand-dark group-hover:text-brand-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-brand-muted font-sans leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-8 border-t border-brand-muted/10 flex items-center justify-between text-[11px] font-mono font-medium text-brand-muted select-none group-hover:text-brand-primary transition-colors duration-300">
                    <span className="uppercase tracking-widest text-[10px]">Guaranteed Standard</span>
                    <span className="text-brand-primary font-bold">100% Verified</span>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
