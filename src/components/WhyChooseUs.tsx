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
                <p className="text-[11px] text-black/40 font-mono mt-1 font-semibold uppercase tracking-wider">
                  {stat.subLabel}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us: 3-column Bento Features Grid Layout */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
            <div className="text-left max-w-xl">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-primary mb-3">
                Core Assets Standard
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-black tracking-tight leading-tight">
                Crafted For Professional Speed
              </h2>
            </div>
            <p className="text-sm text-black/50 font-sans max-w-sm text-left">
              Say goodbye to rendering lags and licensing headaches. Our resources are optimized for top-tier editor output under tight client deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURE_ITEMS.map((feature, idx) => {
              // Dynamically resolve Icon safely
              const IconComponent = (Icons as any)[feature.iconName] || Icons.Compass;

              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="bg-white border border-black/5 hover:border-black/10 hover:shadow-xl transition-all rounded-3xl p-8 text-left flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    {/* Visual icon badge container */}
                    <div className="w-11 h-11 rounded-xl bg-brand-dark flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="w-4.5 h-4.5 stroke-[1.8]" />
                    </div>

                    <div className="space-y-2.5">
                      <h3 className="font-display font-bold text-lg text-black group-hover:text-brand-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-black/60 font-sans leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-black/5 flex items-center text-[11px] font-mono font-bold uppercase tracking-wider text-black/40 group-hover:text-brand-primary transition-colors select-none">
                    <span>Verified Quality Metric</span>
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
