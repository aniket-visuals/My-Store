import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Tag, 
  LayoutGrid, 
  User, 
  ShieldCheck, 
  Plus, 
  Minus,
  ArrowUpRight
} from "lucide-react";
import { FAQ_DATA } from "../data";

const CATEGORIES = [
  { id: "general", label: "General", icon: MessageSquare },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "features", label: "Features", icon: LayoutGrid },
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 xl:py-28 bg-[#F4F4F5] border-t border-black/5 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
          <p className="text-[13px] font-bold text-[#F97316] tracking-widest flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
            FAQ
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
          </p>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-black tracking-tight">
            Find answers <span className="text-[#F97316]">by topic</span>
          </h2>
          <p className="text-base text-gray-500 font-medium">
            Choose a category to find the information you need.
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${
                  isActive 
                    ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/25" 
                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-black shadow-sm"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#F97316]"}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main FAQ Container & Decorative Note */}
        <div className="relative">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 max-w-3xl mx-auto min-h-[300px]">
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {FAQ_DATA.filter(item => item.category === activeCategory).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No questions available in this category yet.</p>
                    </div>
                  ) : (
                    FAQ_DATA.filter(item => item.category === activeCategory).map((item) => {
                      const isOpen = openId === item.id;

                      return (
                        <div key={item.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                          <button
                            onClick={() => toggleAccordion(item.id)}
                            className="w-full flex items-center justify-between py-4 text-left font-display font-bold text-[17px] text-black cursor-pointer bg-white transition-all select-none hover:text-[#F97316] group"
                          >
                            <span className="pr-8">{item.question}</span>
                            
                            <div className="shrink-0 text-black group-hover:text-[#F97316] transition-colors">
                              {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="pb-4">
                                  <div className="bg-[#F8F9FA] rounded-xl p-5">
                                    <p className="text-[15px] leading-relaxed text-gray-600 font-sans">
                                      {item.answer}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Decorative Arrow & Text (Desktop Only) */}
          <div className="hidden lg:flex absolute -right-4 top-10 flex-col items-center rotate-6 pointer-events-none">
            <span className="font-handwriting text-[#F97316] text-xl max-w-[150px] text-center leading-tight">
              Different categories for easier navigation!
            </span>
            <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2 -ml-8">
              <path d="M15 5C15 5 45 20 20 50" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
              <path d="M15 45L20 50L28 42" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* External developer/support help invitation */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-400 font-mono font-medium">
            STILL HAVE UNRESOLVED TIMELINE CONSTRAINTS?{" "}
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=admin@editorshubstore.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black inline-flex items-center hover:underline hover:text-[#F97316] font-bold ml-1.5 transition-colors"
            >
              Contact Support <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}
