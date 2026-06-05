import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle, ArrowUpRight } from "lucide-react";
import { FAQ_DATA } from "../data";

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1"); // Default open first question

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 xl:py-28 bg-brand-bg border-t border-black/5 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-primary">
            Common Queries
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-black tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Collapsible Accordion Group */}
        <div className="space-y-4">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-black/5 hover:border-black/10 transition-colors rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full flex items-center justify-between p-6 sm:p-7 text-left font-display font-semibold text-base text-black cursor-pointer bg-white transition-all select-none hover:text-brand-primary"
                >
                  <div className="flex items-center space-x-4">
                    <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? "text-brand-primary" : "text-black/30"}`} />
                    <span>{item.question}</span>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-black/40 shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-7 sm:px-7 sm:pb-8 pt-0 border-t border-black/5 bg-brand-bg/30">
                        <p className="text-sm sm:text-base leading-relaxed text-black/65 font-sans pt-4 max-w-3xl text-left">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

        {/* External developer/support help invitation */}
        <div className="mt-12 text-center">
          <p className="text-xs text-black/40 font-mono font-medium">
            STILL HAVE UNRESOLVED TIMELINE CONSTRAINTS?{" "}
            <a
              href="mailto:support@editorsraj.com"
              className="text-black inline-flex items-center hover:underline hover:text-brand-primary font-bold ml-1.5"
            >
              Contact Support <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}
