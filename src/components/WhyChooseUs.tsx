import React from "react";
import { motion } from "motion/react";
import { STATS_DATA } from "../data";

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="relative py-20 xl:py-24 bg-[#FFFFFF] border-t border-b border-black/5">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary/3 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
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

      </div>
    </section>
  );
}

