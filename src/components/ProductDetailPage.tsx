import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Star, Download, Volume2, ShieldCheck, Play, Pause, 
  Sparkles, Check, Cpu, Send, Mail, AlertCircle, FileCode, Clock,
  Lock, ArrowRight, Video, FileCheck, Headphones, HelpCircle,
  Award, Shield, Calendar, Terminal, Info, Users, Share2, HelpCircle as FaqIcon, MessageSquare,
  Trash2, X
} from "lucide-react";
import { Product } from "../types";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  addToCart: (product: Product) => void;
  inCart: boolean;
}

// Simulated High-Fidelity products database to populate related products beautifully
const MOCK_RELATED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aether 8D Cinematic Sound Pack",
    price: 29,
    originalPrice: 49,
    category: "sound-effects",
    rating: 4.9,
    reviewsCount: 148,
    downloadCount: 1240,
    description: "A meticulously recorded collection of sub-heavy impacts, analog synth sweeps, foley textures, and atmospheric whooshes. Perfect for cinematic videos and visual essays.",
    features: ["85 High-Quality WAV Files (24-bit/48kHz)", "Frictional Sweeps & Dynamic Whooshes", "Sub-Bass Drops & Structural Impacts", "100% Royalty-Free and cleared for Commercial Use"],
    compatibility: "Any NLE (Premiere Pro, DaVinci Resolve, FCPX, AE, etc.)",
    fileSize: "1.4 GB",
    fileType: "WAV",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    audioPreview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    isPopular: true
  },
  {
    id: "p2",
    name: "Helios Cinema LUTs & Color Grading Kit",
    price: 19,
    originalPrice: 35,
    category: "color-grading",
    rating: 4.8,
    reviewsCount: 92,
    downloadCount: 840,
    description: "Bring rich filmic color curves, aesthetic shadows, and cinematic highlight rolls to any source footage. Includes generic 10-bit log and cinematic rec. 709 converters.",
    features: ["15 Professional grade .CUBE conversion LUTs", "Aesthetic vintage & modern film style maps", "Perfect highlight recovery & soft roll-off templates", "Cleared for YouTube, commercial ads & broadcasts"],
    compatibility: "Premiere, DaVinci Resolve, Final Cut Pro, CapCut Pro",
    fileSize: "140 MB",
    fileType: "CUBE Look Files",
    image: "https://images.unsplash.com/photo-1492044715545-15ddedd84e5e?auto=format&fit=crop&w=800&q=80",
    isPopular: false
  },
  {
    id: "p3",
    name: "Neptune Kinetic Typography Engine",
    price: 39,
    originalPrice: 59,
    category: "templates",
    rating: 5.0,
    reviewsCount: 64,
    downloadCount: 420,
    description: "Drop gorgeous dynamic kinetic subtitles, responsive background titles, and high-retention text cards right inside your editing timeline with a single click.",
    features: ["30 High-retention kinetic Premiere Pro templates", "Auto-responsive timeline scale boundaries", "No keyframing required, 1-click text replacement", "Dynamic color controls & adjustable spring speed"],
    compatibility: "Adobe Premiere Pro / After Effects CC 2021+",
    fileSize: "512 MB",
    fileType: "MOGRT Templates",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    isPopular: true
  },
  {
    id: "p4",
    name: "Cyberpunk HUD Futuristic Overlay Kit",
    price: 25,
    originalPrice: 45,
    category: "overlays",
    rating: 4.7,
    reviewsCount: 112,
    downloadCount: 670,
    description: "Dumbfound your audience with ultra-detailed holographic widgets, tactical scope metrics, blinking terminal panels, and animated code telemetry lines.",
    features: ["45 ProRes 4444 pre-keyed 4K HUD layouts", "Transparent background, drag-and-drop workflow", "Loopable files for long ambient backdrops", "Aesthetic grid widgets and focus tracker overlays"],
    compatibility: "Any non-linear editing software supporting Alpha",
    fileSize: "2.3 GB",
    fileType: "MOV Files (Pre-Keyed)",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    isPopular: false
  }
];

const DYNAMIC_FAQS: Record<string, { q: string; a: string }[]> = {
  p1: [
    { q: "Do these sound effects work on mobile video editing apps?", a: "Yes! Since they are saved in industry-standard premium 24-bit WAV format, you can import and play them perfectly inside CapCut, LumaFusion, Premiere Rush, or any other mobile timeline." },
    { q: "Is attribution or a visual credit required?", a: "No attribution is required. You can use these royalty-free files completely anonymously in commercials, YouTube videos, and client assets without paying royalties or tagging are store." },
    { q: "Will I receive notifications for newly added files?", a: "Yes! Whenever we expand our catalog or add bonus tracks to the pack, a direct link and email notification will automatically reach your inbox free of charge." }
  ],
  p2: [
    { q: "Will this LUT kit slow down my Premiere playback?", a: "No, these are highly optimized 33-point cube profiles which process exceptionally fast in real-time, even on older laptop workstations." },
    { q: "Which log patterns work best with this color kit?", a: "They are built globally to match Sony S-Log3, DJI D-Log, Canon C-Log, iPhone cinematic formats, or generic default Rec.709 footage." },
    { q: "Are these LUTs fully adjustable?", a: "Absolutely! You can easily adjust the intensity/opacity slider in Lumetri, HDR, or DaVinci's node panel to fine-tune the output to your taste." }
  ],
  p3: [
    { q: "Do I need Adobe After Effects installed to use templates in Premiere?", a: "No! These are pre-rendered MOGRT templates. You can adjust texts, font files, and positioning values directly in Premiere's Essential Graphics deck." },
    { q: "Can I use custom system fonts with these presets?", a: "Yes, you can search and apply any fonts already installed on your system or active Adobe Creative Cloud subscription." }
  ],
  p4: [
    { q: "Are the alpha video overlays pre-rendered with black screens?", a: "No, these are pre-encoded in genuine Apple ProRes 4444 which has full alpha channel transparency pre-cleared. Just drag, drop, and overlay!" },
    { q: "Can I adjust the orange laser color to match my channel colors?", a: "Yes, you can drop a simple 'HSL Tune' or 'Change Color' effect on your track to shift the neon orange to green, purple, yellow, or teal." }
  ]
};

const DYNAMIC_REVIEWS: Record<string, { author: string; handle: string; rate: number; date: string; review: string; avatar: string }[]> = {
  p1: [
    { author: "Marcus Vance", handle: "@marcus_vanced", rate: 5, date: "May 28, 2026", review: "The deep sub drops and industrial sweep whooshes are exactly what I needed. They add instant dramatic power to my commercials. Phenomenal foley quality.", avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=120&h=120&q=80" },
    { author: "Evelyn Reed", handle: "@evelyncreative", rate: 5, date: "June 2, 2026", review: "Crisp sounding, low latency, and cleared right out of the box with zero YouTube claims. Extremely satisfied with the acoustic depth.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80" }
  ],
  p2: [
    { author: "Tyler K.", handle: "@tylershots", rate: 5, date: "April 14, 2026", review: "The skin tonalities remain super natural while delivering that deep, cinematic Hollywood steel-blue backdrop. Absolute magic for commercial B-rolls.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80" },
    { author: "Sara J.", handle: "@saralogs", rate: 5, date: "May 10, 2026", review: "Excellent conversion for DJI D-Cinelike. The atmospheric warmth curves are gorgeous. Recommending this strongly to other travel filmmakers.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" }
  ],
  p3: [
    { author: "Nate Patterson", handle: "@nate_renders", rate: 5, date: "May 20, 2026", review: "High-retention kinetic titles that actually engage! The keyframe responsive duration scaling works like standard CSS container queries. Saved me hours of timing.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" }
  ],
  p4: [
    { author: "Clara Brooks", handle: "@claracut", rate: 5, date: "June 3, 2026", review: "The HUD holographic widgets look so incredibly sharp. Highly modular widgets that make any high-tech breakdown feel alive. Worth every penny.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80" }
  ]
};

const COMMON_FAQS = [
  { q: "Is payment absolutely safe?", a: "Yes, our processing systems utilize AES SSL 256-bit encryption pipelines ensuring complete tokenization and safe clearance." },
  { q: "Can I refund if I am not satisfied?", a: "Due to the digital nature of instant download folders, we offer a 24-hour creative satisfaction guarantee. Send us a message and we'll resolve any issues." },
  { q: "Are updates included free of charge?", a: "Yes, completely! Any minor optimizations, style corrections, or codec updates are delivered directly to your email free for a lifetime." }
];

const getGalleryImages = (prod: Product): string[] => {
  const fallbackGalleries: Record<string, string[]> = {
    p1: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80"
    ],
    p2: [
      "https://images.unsplash.com/photo-1492044715545-15ddedd84e5e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
    ],
    p3: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    p4: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
    ]
  };
  
  return fallbackGalleries[prod.id] || [
    prod.image,
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
  ];
};

export default function ProductDetailPage({
  product,
  onBack,
  addToCart,
  inCart
}: ProductDetailPageProps) {
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadStep, setDownloadStep] = useState<"form" | "compiling" | "ready">("form");
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<string>(product.image);

  const [reviews, setReviews] = useState<{ author: string; handle: string; rate: number; date: string; review: string; avatar: string }[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [verificationKey, setVerificationKey] = useState("");
  const [isKeyUnlocked, setIsKeyUnlocked] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRate, setNewRate] = useState(5);
  const [newReview, setNewReview] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [keyError, setKeyError] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state if initial prop changes
  useEffect(() => {
    setCurrentProduct(product);
    setActiveImage(product.image);
  }, [product]);

  // Scroll to top on product switch & sync reviews
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setDownloadStep("form");
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setActiveImage(currentProduct.image);

    const saved = localStorage.getItem(`custom_reviews_${currentProduct.id}`);
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse reviews from localStorage", err);
        const defaults = DYNAMIC_REVIEWS[currentProduct.id] || [];
        setReviews(defaults);
      }
    } else {
      const defaults = DYNAMIC_REVIEWS[currentProduct.id] || [];
      setReviews(defaults);
      localStorage.setItem(`custom_reviews_${currentProduct.id}`, JSON.stringify(defaults));
    }

    // Reset review form state
    setShowReviewForm(false);
    setVerificationKey("");
    setIsKeyUnlocked(false);
    setNewAuthor("");
    setNewRate(5);
    setNewReview("");
    setReviewError("");
    setKeyError("");
  }, [currentProduct.id]);

  // Audio Playback simulation / loader
  useEffect(() => {
    if (currentProduct.audioPreview) {
      audioRef.current = new Audio(currentProduct.audioPreview);
      audioRef.current.volume = 0.4;

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
  }, [currentProduct.id, currentProduct.audioPreview]);

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

  const handleFreeCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setDownloadStep("compiling");
    setIsSubmitting(true);
    setSimulatedProgress(0);

    // Dynamic compilation simulation
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadStep("ready");
          setIsSubmitting(false);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  // Compute tier price based on current active license type
  const getTierPrice = () => {
    return currentProduct.price;
  };

  const getTierOriginalPrice = () => {
    return currentProduct.originalPrice || Math.round(currentProduct.price * 1.6);
  };

  const getActiveFaqs = () => {
    const key = DYNAMIC_FAQS[currentProduct.id] ? currentProduct.id : "p1";
    return [...(DYNAMIC_FAQS[key] || []), ...COMMON_FAQS];
  };

  const getActiveReviews = () => {
    return reviews;
  };

  const getDynamicRating = () => {
    if (reviews.length === 0) return 0.0;
    const sum = reviews.reduce((acc, r) => acc + r.rate, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const getDynamicReviewsCount = () => {
    return reviews.length;
  };

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = verificationKey.trim();
    if (cleanKey.toLowerCase() === "addverifiedreviews") {
      setIsKeyUnlocked(true);
      setKeyError("");
    } else {
      setKeyError('Incorrect key. Please provide "addverifiedreviews".');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim()) {
      setReviewError("Please enter your name.");
      return;
    }
    if (!newReview.trim()) {
      setReviewError("Please write a small review.");
      return;
    }

    const cleanAuthor = newAuthor.trim();
    const formattedHandle = "@" + cleanAuthor.toLowerCase().replace(/[^a-z0-9_]/g, "");

    const newReviewItem = {
      author: cleanAuthor,
      handle: formattedHandle,
      rate: newRate,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      review: newReview.trim(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
    };

    const nextReviews = [newReviewItem, ...reviews];
    setReviews(nextReviews);
    localStorage.setItem(`custom_reviews_${currentProduct.id}`, JSON.stringify(nextReviews));

    // Clear fields and close
    setNewAuthor("");
    setNewRate(5);
    setNewReview("");
    setReviewError("");
    setShowReviewForm(false);
    setIsKeyUnlocked(false);
    setVerificationKey("");
  };

  const handleDeleteReview = (index: number) => {
    const nextReviews = reviews.filter((_, idx) => idx !== index);
    setReviews(nextReviews);
    localStorage.setItem(`custom_reviews_${currentProduct.id}`, JSON.stringify(nextReviews));
  };

  const otherProducts = MOCK_RELATED_PRODUCTS.filter(p => p.id !== currentProduct.id);

  return (
    <div id="gumroad-detail-root" className="min-h-screen bg-brand-bg text-brand-dark pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation Line */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="group flex items-center space-x-2 text-xs font-mono font-medium uppercase tracking-wider text-brand-dark/50 hover:text-brand-primary transition-colors cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Marketplace</span>
          </button>
          
          <div className="hidden sm:flex items-center space-x-2 font-mono text-[10px] text-brand-dark/40 uppercase tracking-widest">
            <span>Aniket Visuals</span>
            <span>/</span>
            <span>Shop</span>
            <span>/</span>
            <span className="text-brand-primary font-semibold">{currentProduct.category.replace("-", " ")}</span>
          </div>
        </div>

        {/* =====================================
            1. LARGE TOP MEDIA PREVIEW BOARD
           ===================================== */}
        <div className="w-full bg-white border border-brand-dark/5 rounded-3xl overflow-hidden shadow-xl mb-12 relative flex flex-col">
          <div className="aspect-[21/9] md:aspect-[24/9] w-full bg-black relative flex items-center justify-center overflow-hidden group">
            {currentProduct.videoPreview ? (
              <video
                src={currentProduct.videoPreview}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeImage}
                alt={currentProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />
            )}
            
            {/* Absolute Overlay info stripes */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="text-left space-y-1.5">
                <span className="bg-brand-primary text-white font-mono text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Studio Cleared
                </span>
                <h3 className="text-white font-display font-bold text-lg md:text-3xl tracking-tight drop-shadow-sm">
                  {currentProduct.name}
                </h3>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25">
                <Video className="w-3.5 h-3.5 text-brand-primary" />
                <span className="text-white font-mono text-[10px] tracking-wider font-semibold">Live Preview Active</span>
              </div>
            </div>
            
            <div className="absolute top-4 left-4 bg-brand-dark/95 text-white font-mono text-[9px] font-medium px-3 py-1.5 backdrop-blur-md tracking-wider uppercase rounded-full border border-white/10">
              {currentProduct.category.replace("-", " ")}
            </div>
          </div>

          {/* Thumbnail Slides selection tray */}
          <div className="p-4 bg-white border-t border-brand-dark/5 flex items-center justify-start gap-4 overflow-x-auto select-none">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dark/40 font-bold px-1 whitespace-nowrap">
              Asset Media Slides
            </span>
            <div className="flex items-center gap-3">
              {getGalleryImages(currentProduct).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative h-14 w-24 sm:h-16 sm:w-28 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer shrink-0 ${
                    activeImage === imgUrl
                      ? "border-brand-primary ring-2 ring-brand-primary/10 scale-102"
                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-102"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Slide ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-brand-dark/5 hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-brand-dark/80 px-1 py-0.5 rounded text-[8px] font-mono font-bold text-white uppercase tracking-wider">
                    #{idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================
            2. MASTER TWO-COLUMN GRID LAYOUT
           ===================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* ================= LEFT MAIN COLUMN ================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Essential Metadata Box */}
            <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-display font-semibold text-2xl sm:text-4xl text-brand-dark tracking-tight leading-tight">
                  {currentProduct.name}
                </h1>
                
                <div className="flex items-center space-x-1.5 font-mono text-xs text-brand-primary bg-brand-primary/5 px-3.5 py-1.5 rounded-full border border-brand-primary/10">
                  <Download className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="font-semibold text-brand-primary">{currentProduct.downloadCount || 120}+ Clean Downloads</span>
                </div>
              </div>

              <p className="text-sm font-sans tracking-tight text-brand-dark/75 leading-relaxed font-medium">
                {currentProduct.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-brand-dark/5 text-xs font-mono">
                <div className="flex items-center text-brand-primary space-x-0.5">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const avg = getDynamicRating();
                    return (
                      <Star 
                        key={s} 
                        className={`w-4 h-4 fill-current stroke-transparent ${
                          s <= Math.round(avg) ? "text-brand-primary" : "text-brand-dark/10"
                        }`} 
                      />
                    );
                  })}
                  <span className="font-bold text-brand-dark ml-1.5">
                    {getDynamicRating() > 0 ? getDynamicRating().toFixed(1) : "0.0"}
                  </span>
                </div>
                <span className="text-brand-dark/20">•</span>
                <span className="text-brand-dark/50 underline font-medium">
                  ({getDynamicReviewsCount()} verified {getDynamicReviewsCount() === 1 ? "rating" : "ratings"})
                </span>
                <span className="text-brand-dark/20">•</span>
                <span className="text-brand-dark/50">By <strong className="text-brand-dark font-medium">Aniket Visuals</strong></span>
              </div>
            </div>

            {/* Editorial Product Description Block */}
            <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-6">
              <h2 className="font-display font-semibold text-lg text-brand-dark border-b border-brand-dark/10 pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary shrink-0" />
                <span>Product Description</span>
              </h2>

              <div className="space-y-4 font-sans text-sm text-brand-dark/80 leading-relaxed font-normal">
                <p>
                  High-fidelity digital design templates, presets, and waveforms engineered to instantly capture your audience's attention. Every component undergoes strict workflow pressure-testing to guarantee fluid integrations on even the most complex video essay or commercial timelines.
                </p>
                <p className="font-semibold text-brand-dark">
                  Here is what you are getting on your local drive instantly:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {currentProduct.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 px-3.5 py-3 bg-brand-dark/[0.015] border border-brand-dark/5 rounded-xl">
                      <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-brand-dark font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version History Changelog card */}
              <div className="mt-8 pt-6 border-t border-brand-dark/10 space-y-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-brand-primary" />
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-dark">Version Changelog</h4>
                </div>
                
                <div className="space-y-3 font-mono text-[11px] text-brand-dark/60">
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary font-bold whitespace-nowrap">v1.2 (Latest)</span>
                    <span>• Fully rebuilt for Premiere 2026/DaVinci 19 updates, optimized wave audio clearance curves.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-dark/40 whitespace-nowrap">v1.1 patch</span>
                    <span>• Added 15 bonus high-intensity foley transients and custom 10-bit color presets.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-dark/40 whitespace-nowrap">v1.0 release</span>
                    <span>• Core package delivery containing standard license models.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Software Compatibility Detail Block */}
            <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-4">
              <h3 className="font-display font-semibold text-base text-brand-dark flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-brand-primary" />
                <span>Software Compatibility</span>
              </h3>
              
              <div className="p-5 bg-brand-dark/[0.015] border border-brand-dark/5 rounded-xl leading-relaxed font-mono text-xs text-brand-dark/80">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white border border-brand-dark/5 p-3 rounded-xl shadow-sm">
                    <span className="font-bold block text-brand-primary">PR</span>
                    <span className="text-[10px] text-brand-dark/40 block mt-0.5">Premiere CC</span>
                  </div>
                  <div className="bg-white border border-brand-dark/5 p-3 rounded-xl shadow-sm">
                    <span className="font-bold block text-blue-500">AE</span>
                    <span className="text-[10px] text-brand-dark/40 block mt-0.5">After Effects</span>
                  </div>
                  <div className="bg-white border border-brand-dark/5 p-3 rounded-xl shadow-sm">
                    <span className="font-bold block text-indigo-500">DV</span>
                    <span className="text-[10px] text-brand-dark/40 block mt-0.5">DaVinci 18+</span>
                  </div>
                  <div className="bg-white border border-brand-dark/5 p-3 rounded-xl shadow-sm">
                    <span className="font-bold block text-red-500">FC</span>
                    <span className="text-[10px] text-brand-dark/40 block mt-0.5">Final Cut Pro</span>
                  </div>
                </div>
                <p className="mt-4 text-[11px] leading-relaxed font-sans font-medium text-brand-dark/50 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>Works with all major audio and visual workstations. Sound effects are high quality 48kHz WAV files.</span>
                </p>
              </div>
            </div>

            {/* Perpetual Usage Rights Block */}
            <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-4">
              <h3 className="font-display font-semibold text-base text-brand-dark flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Commercial Usage Rights</span>
              </h3>
              
              <div className="space-y-2 text-xs sm:text-sm font-sans font-medium text-brand-dark/80">
                <div className="flex items-start space-x-3 bg-emerald-500/[0.02] border border-emerald-500/15 p-4 rounded-xl">
                  <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-dark/80 font-medium leading-relaxed">
                    <strong>100% Royalty Free perpetual usage clearance:</strong> Use in monetize platforms including YouTube, Twitch, TikTok, Instagram, commercial advertisements, film displays, and indie broadcasts with no limitations or unexpected copyright claims.
                  </p>
                </div>
              </div>
            </div>

            {/* Gumroad Frequently Asked Questions Accordion */}
            <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-6">
              <h3 className="font-display font-semibold text-base text-brand-dark border-b border-brand-dark/10 pb-3 flex items-center space-x-2">
                <FaqIcon className="w-5 h-5 text-brand-primary" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3.5">
                {getActiveFaqs().map((faq, idx) => (
                  <div 
                    key={idx} 
                    className="border border-brand-dark/5 rounded-xl overflow-hidden bg-brand-dark/[0.012]"
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-mono font-bold uppercase tracking-wider text-brand-dark hover:bg-brand-dark/[0.03] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-brand-primary text-base ml-4 font-bold">
                        {activeFaq === idx ? "−" : "+"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {activeFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-4 text-xs font-sans font-medium text-brand-dark/60 leading-relaxed border-t border-brand-dark/5 pt-2"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Customer Reviews Grid */}
            <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-dark/10 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-display font-semibold text-base text-brand-dark flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                    <span>Verified Editor Reviews</span>
                  </h3>
                  <p className="text-[10px] font-mono text-brand-dark/40 font-medium">Real-time designer feedback hub</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowReviewForm(!showReviewForm);
                    // Reset fields
                    if (showReviewForm) {
                      setIsKeyUnlocked(false);
                      setVerificationKey("");
                    }
                    setKeyError("");
                    setReviewError("");
                  }}
                  className="flex items-center justify-center space-x-1.5 bg-brand-dark text-white hover:bg-brand-primary text-[10px] font-mono tracking-wider font-bold uppercase px-4 py-2.5 rounded-xl transition-all select-none cursor-pointer duration-200"
                >
                  {showReviewForm ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Close Control</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Add your review</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Review Author / Verification Form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden bg-brand-dark/[0.015] border border-brand-dark/5 rounded-2xl p-5 sm:p-6 mb-4 space-y-4"
                  >
                    {!isKeyUnlocked ? (
                      /* Verification Key Challenge */
                      <form onSubmit={handleVerifyKey} className="space-y-3 text-left">
                        <div className="space-y-1.5">
                          <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-brand-primary">
                            Security Protocol
                          </span>
                          <h4 className="font-display font-bold text-sm text-brand-dark leading-snug">
                            Unlock Verified Reviews Deck
                          </h4>
                          <p className="text-xs font-medium text-brand-dark/40 leading-relaxed">
                            To ensure high-integrity product reviews, please provide our clearance entry key:
                          </p>
                        </div>

                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder='Enter "addverifiedreviews"'
                            value={verificationKey}
                            onChange={(e) => setVerificationKey(e.target.value)}
                            className="w-full bg-white border border-brand-dark/15 px-4 py-2.5 rounded-xl text-xs font-mono placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                          />
                          {keyError && (
                            <p className="text-[10px] font-mono font-extrabold text-red-600 mt-1 flex items-center space-x-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              <span>{keyError}</span>
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-brand-dark text-white hover:bg-brand-primary px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                        >
                          Unlock Entry Form
                        </button>
                      </form>
                    ) : (
                      /* Authenticated Creative Feedback Builder */
                      <form onSubmit={handleAddReview} className="space-y-4 text-left">
                        <div className="flex items-center space-x-2.5 bg-emerald-500/[0.04] border border-emerald-500/15 p-3 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Clearance Verified — Add Feedback Item</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Author Title Name */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-brand-dark/50 uppercase tracking-widest font-bold">
                              Your Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Liam Parker"
                              value={newAuthor}
                              onChange={(e) => setNewAuthor(e.target.value)}
                              className="w-full bg-white border border-brand-dark/15 px-4 py-2.5 rounded-xl text-xs placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                              required
                            />
                          </div>

                          {/* Interactive stars selectors */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-brand-dark/50 uppercase tracking-widest font-bold">
                              Rating Levels
                            </label>
                            <div className="flex items-center space-x-1.5 h-[38px]">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setNewRate(val)}
                                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                  title={`${val} Stars`}
                                >
                                  <Star
                                    className={`w-[18px] h-[18px] fill-current ${
                                      val <= newRate ? "text-brand-primary" : "text-brand-dark/10"
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="text-[10px] font-mono font-bold text-brand-dark/40 ml-2">
                                ({newRate} / 5)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Review script comments body */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono text-brand-dark/50 uppercase tracking-widest font-bold">
                            Creative Feedback
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Type your review (e.g. Incredible fidelity, perfectly optimized drag and drop overlays!)"
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            className="w-full bg-white border border-brand-dark/15 pre-wrap px-4 py-3 rounded-xl text-xs placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none"
                            required
                          />
                        </div>

                        {reviewError && (
                          <p className="text-[10px] font-mono font-bold text-red-600 flex items-center space-x-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span>{reviewError}</span>
                          </p>
                        )}

                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            type="submit"
                            className="flex-1 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2.5 h-[38px] rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                          >
                            Publish Verified Review
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsKeyUnlocked(false);
                              setShowReviewForm(false);
                              setVerificationKey("");
                            }}
                            className="px-4 py-2.5 h-[38px] border border-brand-dark/10 hover:border-brand-dark hover:bg-brand-dark/5 rounded-xl text-brand-dark/70 text-[10px] font-mono uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {getActiveReviews().length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-brand-dark/15 rounded-2xl bg-brand-dark/[0.005] py-12 space-y-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-sm text-brand-dark">No reviews published yet</h4>
                      <p className="text-xs font-medium text-brand-dark/40 max-w-sm mx-auto leading-relaxed">
                        Be the first verified customer to share your creative feedback and review this premium digital asset.
                      </p>
                    </div>
                  </div>
                ) : (
                  getActiveReviews().map((rev, idx) => (
                    <div key={idx} className="p-5 bg-brand-dark/[0.015] border border-brand-dark/5 rounded-xl space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={rev.avatar} 
                            alt={rev.author} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full border border-brand-dark/10 object-cover"
                          />
                          <div className="text-left leading-tight">
                            <p className="text-xs font-bold text-brand-dark">{rev.author}</p>
                            <p className="text-[10px] font-mono text-brand-dark/40 mt-0.5">{rev.handle}</p>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <div className="flex items-center text-brand-primary text-xs tracking-tighter">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 fill-current ${s <= rev.rate ? "text-brand-primary" : "text-black/10"}`} />
                            ))}
                          </div>
                          <span className="text-[9px] font-mono text-brand-dark/40 mt-1 block">{rev.date}</span>
                        </div>
                      </div>

                      <p className="text-xs font-sans font-medium text-brand-dark/75 leading-relaxed italic">
                        "{rev.review}"
                      </p>
                      
                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="flex items-center space-x-1.5 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-500/[0.08] border border-emerald-500/10 px-2.5 py-1 rounded-full w-max uppercase tracking-wider select-none">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          <span>Verified Purchaser</span>
                        </div>

                        {/* Owner Admin Mode Delete Action Button (Visible only when unlocked with 'Verified reviews' key) */}
                        {isKeyUnlocked && (
                          <button
                            onClick={() => handleDeleteReview(idx)}
                            className="flex items-center space-x-1 hover:text-red-600 text-brand-dark/40 font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer select-none border border-transparent hover:border-red-500/10"
                            title="Delete this item permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ================= RIGHT STICKY BILLING SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Authentic Premium Checkout Card */}
            <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-brand-dark/[0.03] text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/15 px-2.5 py-1 rounded-full">
                  Lifetime Instant Delivery
                </span>
                
                <h3 className="font-display font-bold text-base text-brand-dark uppercase tracking-wide">
                  Checkout License Option
                </h3>

                {/* Unified License Standard Option */}
                <div className="flex items-center space-x-2.5 bg-emerald-500/[0.04] border border-emerald-500/15 p-3.5 rounded-xl text-left select-none">
                  <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 leading-none">
                      Perpetual Commercial License Included
                    </span>
                    <span className="block text-[9px] font-mono text-brand-dark/40 font-medium leading-none">
                      Full lifetime access with absolute clearance
                    </span>
                  </div>
                </div>

                {/* Dynamic Price Tracker Info */}
                <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-4.5 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[9px] font-mono text-brand-dark/40 uppercase tracking-widest">Pricing Structure</p>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider font-mono mt-0.5">
                      Full Creator Clearance
                    </p>
                  </div>
                  
                  <div className="text-right leading-none">
                    <span className="text-[10px] font-mono text-brand-dark/30 line-through block mb-1">
                      ${getTierOriginalPrice()} USD
                    </span>
                    <span className="font-display font-bold text-2xl tracking-tight text-brand-dark">
                      ${getTierPrice()} USD
                    </span>
                  </div>
                </div>

                {/* Simulated Payment Delivery Stream */}
                <div className="pt-4 border-t border-brand-dark/5">
                  <AnimatePresence mode="wait">
                    {downloadStep === "form" && (
                      <motion.div
                        key="email-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <p className="text-[11px] text-brand-dark/50 font-sans tracking-tight leading-relaxed">
                          Enter your professional email address inside our secure gateway below to generate custom download credentials instantly.
                        </p>
                        
                        <form onSubmit={handleFreeCheckout} className="space-y-3">
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
                            <input
                              type="email"
                              required
                              placeholder="editor@studio.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full text-xs font-mono font-medium pl-10 pr-4 py-3 bg-brand-dark/[0.015] border border-brand-dark/10 rounded-xl focus:ring-1 focus:ring-brand-primary outline-none placeholder:text-brand-dark/30 transition-all"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-brand-accent text-white py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/10 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center space-x-2.5 active:scale-[0.98]"
                          >
                            <Send className="w-4 h-4 animate-pulse" />
                            <span>Get This Asset</span>
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {downloadStep === "compiling" && (
                      <motion.div
                        key="loading-tracker"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-center py-6 space-y-4"
                      >
                        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full flex items-center justify-center mx-auto">
                          <Cpu className="w-6 h-6 animate-spin" />
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-brand-dark uppercase">Allocating Assets</h4>
                          <p className="text-[11px] font-mono text-brand-dark/50">Building ZIP package for {email}...</p>
                        </div>

                        {/* Progress Meter bar */}
                        <div className="w-full bg-brand-dark/[0.015] border border-brand-dark/5 rounded-full h-2 overflow-hidden mx-auto mt-2">
                          <div 
                            className="bg-brand-primary h-full transition-all duration-200"
                            style={{ width: `${simulatedProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-brand-primary font-bold">{simulatedProgress}% READY</span>
                      </motion.div>
                    )}

                    {downloadStep === "ready" && (
                      <motion.div
                        key="ready-reveal"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-5 text-center py-2"
                      >
                        <div className="w-12 h-12 bg-emerald-50 border border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                          <FileCheck className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-mono font-bold text-emerald-600 uppercase tracking-wider">Verification Successful</h4>
                          <p className="text-xs font-sans font-medium text-brand-dark/50 leading-relaxed">
                            Lifetime package unlocked successfully. Download is queued. Backup credentials deployed to <strong>{email}</strong>.
                          </p>
                        </div>

                        {/* File details cards */}
                        <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-4 rounded-xl text-left space-y-2.5 font-mono text-xs text-brand-dark/80">
                          <div className="flex items-center justify-between">
                            <span className="text-brand-dark/40 uppercase text-[9px] tracking-wider">Download Key:</span>
                            <span className="font-bold">AZ-GUM-RAW-{currentProduct.id.toUpperCase()}-K92</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-brand-dark/40 uppercase text-[9px] tracking-wider">File Size:</span>
                            <span className="font-bold text-brand-primary shrink-0">{currentProduct.fileSize}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-brand-dark/40 uppercase text-[9px] tracking-wider">Format Standard:</span>
                            <span className="font-bold">{currentProduct.fileType}</span>
                          </div>
                        </div>

                        <a
                          href="/files/editors_demo_pack.zip"
                          download
                          onClick={() => {
                            alert("Demo download successfully triggered! In production, this starts high-speed secure download from Cloud Run CDN storage buckets.");
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/10 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center space-x-2 select-none"
                        >
                          <Download className="w-4 h-4 animate-bounce" />
                          <span>Direct High-Speed ZIP Download</span>
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-center space-x-2 text-[9px] font-mono font-semibold text-brand-dark/30 pt-4 border-t border-brand-dark/5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="uppercase tracking-wider">Secure SSL Encryption Authorized</span>
                </div>
              </div>
            </div>

            {/* General Metadata Info block */}
            <div className="bg-white border border-brand-dark/5 p-6 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-dark border-b border-brand-dark/5 pb-2">
                Asset Metadata Card
              </h4>
              
              <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-brand-dark">
                <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-2 rounded">
                  <span className="text-brand-dark/40 block text-[9px] uppercase tracking-wider">Weight:</span>
                  <span className="font-semibold text-xs mt-0.5 block">{currentProduct.fileSize}</span>
                </div>
                <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-2 rounded">
                  <span className="text-brand-dark/40 block text-[9px] uppercase tracking-wider">Codec Type:</span>
                  <span className="font-semibold text-xs mt-0.5 block">{currentProduct.fileType}</span>
                </div>
                <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-2 rounded col-span-2">
                  <span className="text-brand-dark/40 block text-[9px] uppercase tracking-wider">Authorized Licensee:</span>
                  <span className="font-semibold text-xs mt-0.5 block uppercase tracking-wider text-brand-primary">Perpetual commercial cleared</span>
                </div>
              </div>
            </div>

            {/* Creator Support Help Desk panel */}
            <div className="bg-brand-dark text-white p-6 rounded-2xl text-left space-y-4 border border-white/5 shadow-xl shadow-brand-dark/10">
              <div className="flex items-center space-x-3 text-white/95">
                <Headphones className="w-5 h-5 text-brand-primary" />
                <h4 className="font-display font-medium text-sm uppercase tracking-wider">Fast Editor Support</h4>
              </div>
              
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Need color-grading format conversion files? Or format triggers for After Effects? Shoot us feedback or replies directly. Standard average turnaround is less than <strong>15 minutes</strong>.
              </p>
            </div>

          </div>

        </div>



      </div>
    </div>
  );
}
