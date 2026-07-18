import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Star, Download, Volume2, ShieldCheck, Play, Pause, 
  Sparkles, Check, Cpu, Send, Mail, AlertCircle, FileCode, Clock,
  Lock, ArrowRight, Video, FileCheck, Headphones, HelpCircle,
  Award, Shield, Calendar, Terminal, Info, Users, Share2, HelpCircle as FaqIcon, MessageSquare,
  Trash2, X, ExternalLink, Heart
} from "lucide-react";
import { Product } from "../types";
import { collection, query, where, getDocs, getDoc, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { formatDescription } from "../utils";

interface ProductDetailPageProps {
  allProducts?: Product[];
  product: Product;
  onBack: () => void;
  addToCart: (product: Product) => void;
  inCart: boolean;
  wishlist?: Product[];
  toggleWishlist?: (product: Product) => void;
}

// Simulated High-Fidelity products database to populate related products beautifully

const COMMON_FAQS = [
  { q: "Is payment absolutely safe?", a: "Yes, our processing systems utilize AES SSL 256-bit encryption pipelines ensuring complete tokenization and safe clearance." },
  { q: "Can I refund if I am not satisfied?", a: "Due to the digital nature of instant download folders, we offer a 24-hour creative satisfaction guarantee. Send us a message and we'll resolve any issues." },
  { q: "Are updates included free of charge?", a: "Yes, completely! Any minor optimizations, style corrections, or codec updates are delivered directly to your email free for a lifetime." }
];

const getGalleryImages = (prod: Product): string[] => {
  if (prod.galleryImages && prod.galleryImages.length > 0) {
    return [prod.image, ...prod.galleryImages];
  }
  return [prod.image];
};

export default function ProductDetailPage({
  allProducts = [],
  product,
  onBack,
  addToCart,
  inCart,
  wishlist = [],
  toggleWishlist
}: ProductDetailPageProps) {
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadStep, setDownloadStep] = useState<"form" | "compiling" | "ready">("form");
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [reviews, setReviews] = useState<{ id?: string; userId?: string; email?: string; author: string; handle: string; rate: number; date: string; review: string; avatar: string }[]>([]);
  const [profileUpdates, setProfileUpdates] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<{
    isOpen: boolean;
    userId?: string;
    author?: string;
    handle?: string;
    avatar?: string | null;
    bio?: string;
    location?: string;
    isLoadingBio?: boolean;
  } | null>(null);



  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileUpdates(prev => prev + 1);
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (selectedProfile?.isOpen && selectedProfile.userId && selectedProfile.isLoadingBio) {
      const fetchBio = async () => {
        try {
          const docRef = doc(db, "users", selectedProfile.userId!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSelectedProfile(prev => prev ? { ...prev, bio: data.bio || "No bio available.", location: data.location || "Unknown", isLoadingBio: false } : null);
          } else {
            setSelectedProfile(prev => prev ? { ...prev, bio: "No bio available.", location: "Unknown", isLoadingBio: false } : null);
          }
        } catch (e: any) {
          console.error("Failed to fetch bio", e);
          let errorMsg = "No bio available.";
          if (e && e.code === "permission-denied") {
            errorMsg = "Bio hidden (Permission denied).";
          }
          setSelectedProfile(prev => prev ? { ...prev, bio: errorMsg, location: "Unknown", isLoadingBio: false } : null);
        }
      };
      
      if (currentUser && currentUser.uid === selectedProfile.userId) {
          const localBio = localStorage.getItem("profile_bio_text");
          const localLoc = localStorage.getItem("profile_location");
          setSelectedProfile(prev => prev ? { ...prev, bio: localBio || "No bio available.", location: localLoc || "Unknown", isLoadingBio: false } : null);
      } else {
          fetchBio();
      }
    }
  }, [selectedProfile?.isOpen, selectedProfile?.userId, selectedProfile?.isLoadingBio, currentUser]);
  const [newRate, setNewRate] = useState(5);
  const [newReview, setNewReview] = useState("");
  const [reviewError, setReviewError] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sync state if initial prop changes
  useEffect(() => {
    setCurrentProduct(product);
    setActiveImage(product.image);
  }, [product]);

  // Scroll to top on product switch & sync reviews
  useEffect(() => {
    setDownloadStep("form");
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setActiveImage(currentProduct.image);

    let active = true;
    const fetchDBReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), where("productId", "==", currentProduct.id));
        const querySnapshot = await getDocs(q);
        const fetched: any[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort client-side by createdAt descending
        fetched.sort((a, b) => {
          const timeA = a.createdAt?.seconds || a.createdAt?.toDate?.()?.getTime() || 0;
          const timeB = b.createdAt?.seconds || b.createdAt?.toDate?.()?.getTime() || 0;
          return timeB - timeA;
        });
        if (active) {
          setReviews(fetched);
        }
      } catch (err) {
        console.error("Error loading reviews from Firestore:", err);
        if (active) {
          setReviews([]);
        }
        try {
          handleFirestoreError(err, OperationType.LIST, "reviews");
        } catch (e) {
          // Suppress after throwing/logging so the app falls back gracefully
        }
      }
    };

    fetchDBReviews();

    // Reset review form state
    setShowReviewForm(false);
    setNewRate(5);
    setNewReview("");
    setReviewError("");

    return () => {
      active = false;
    };
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

  const getActiveFaqs = () => COMMON_FAQS;

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

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setReviewError("Please sign in to write a review.");
      return;
    }
    
    // Check if user already reviewed this product
    const hasReviewed = reviews.some(r => r.userId === currentUser.uid);
    if (hasReviewed) {
      setReviewError("You have already reviewed this product.");
      return;
    }

    if (!newReview.trim()) {
      setReviewError("Please write a small review.");
      return;
    }

        const cleanAuthor = localStorage.getItem("profile_name") || currentUser.displayName || currentUser.email?.split("@")[0] || "Anonymous";
    let formattedHandle = "@" + cleanAuthor.toLowerCase().replace(/[^a-z0-9_]/g, "");
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().username) {
        formattedHandle = "@" + userDocSnap.data().username;
      } else {
        const localHandle = localStorage.getItem("profile_handle");
        if (localHandle) {
          formattedHandle = "@" + localHandle.replace(/[^a-zA-Z0-9_]/g, "");
        }
      }
    } catch (e) {
      console.error("Failed to fetch user handle", e);
    }

    
    const finalAvatar = currentUser.photoURL || null;

    const newReviewItem = {

      productId: currentProduct.id,
      userId: currentUser.uid,
      email: currentUser.email || "",
      author: cleanAuthor,
      handle: formattedHandle,
      rate: newRate,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      review: newReview.trim(),
      avatar: finalAvatar,
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, "reviews"), newReviewItem);
      const localNewItem = {
        id: docRef.id,
        productId: currentProduct.id,
        userId: currentUser.uid,
        email: currentUser.email || "",
        author: cleanAuthor,
        handle: formattedHandle,
        rate: newRate,
        date: newReviewItem.date,
        review: newReview.trim(),
        avatar: newReviewItem.avatar,
        createdAt: { seconds: Math.floor(Date.now() / 1000) }
      };
      setReviews(prev => [localNewItem, ...prev]);
    } catch (err) {
      console.error("Save review failed:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "reviews");
      } catch (e) {
        // Suppress or format error for user
      }
      setReviewError("Failed to save review to the database. Please try again.");
      return;
    }

    // Clear fields and close
    setNewRate(5);
    setNewReview("");
    setReviewError("");
    setShowReviewForm(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    // We already filter in the UI, but we can do a check here too if needed
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error("Delete review failed:", err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
      } catch (e) {
        // Suppress or format message
      }
    }
  };

  const otherProducts = allProducts.filter(p => p.id !== currentProduct.id);

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
          <div className="aspect-[21/9] md:aspect-[24/9] w-full bg-brand-dark/5 relative flex items-center justify-center overflow-hidden group">
            {currentProduct.videoPreview ? (
              <video
                src={currentProduct.videoPreview}
                poster={activeImage}
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
                <h3 className="text-white font-display font-bold text-lg md:text-3xl tracking-tight drop-shadow-sm">
                  {currentProduct.name}
                </h3>
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
                  <span className="font-semibold text-brand-primary">{currentProduct.downloadCount ?? 0}+ Clean Downloads</span>
                </div>
              </div>

              <p className="text-sm font-sans tracking-tight text-brand-dark/75 leading-relaxed font-medium">
                {formatDescription(currentProduct.description)}
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
              <div className="space-y-4 font-sans text-sm text-brand-dark/80 leading-relaxed font-normal whitespace-pre-wrap">
                {currentProduct.fullDescription || currentProduct.description}
              </div>
            </div>

            {/* Perpetual Usage Rights Block */}
            {currentProduct.commercialRights && (
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
            )}
            
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
                    {!currentUser ? (
                      <div className="space-y-4 text-center py-6">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Lock className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h4 className="font-display font-bold text-sm text-brand-dark">Sign in Required</h4>
                        <p className="text-xs font-medium text-brand-dark/40 max-w-sm mx-auto">
                          Please sign in to write a review.
                        </p>
                        <button
                          onClick={() => navigate("/portal")}
                          className="bg-brand-dark text-white hover:bg-brand-primary px-6 py-2.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer inline-flex"
                        >
                          Sign In
                        </button>
                      </div>
                    ) : (
                      /* Authenticated Creative Feedback Builder */
                      <form onSubmit={handleAddReview} className="space-y-4 text-left">
                        <div className="flex items-center space-x-2.5 bg-emerald-500/[0.04] border border-emerald-500/15 p-3 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Posting as {localStorage.getItem("profile_name") || currentUser.displayName || currentUser.email}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                  onClick={() => {
                                    setNewRate(val);
                                    setReviewError("");
                                  }}
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
                            onChange={(e) => {
                              setNewReview(e.target.value);
                              setReviewError("");
                            }}
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
                              setShowReviewForm(false);
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
                  getActiveReviews().map((rev, idx) => {
                  const isCurrentUserReview = currentUser && rev.userId === currentUser.uid;
                  const displayAuthor = isCurrentUserReview ? (localStorage.getItem("profile_name") || rev.author) : rev.author;
                  let displayHandle = rev.handle;
                  if (isCurrentUserReview) {
                      const localHandle = localStorage.getItem("profile_handle");
                      displayHandle = localHandle ? "@" + localHandle.replace(/^@/, '') : rev.handle;
                  }
                  const hasGenericAvatar = rev.avatar === "https://res.cloudinary.com/df5rgwdng/image/upload/v1780754431/bd0c7c0d-f709-453d-9227-298947b772d9-modified_f3lhy1.png";
                  
                  const displayAvatar = isCurrentUserReview ? currentUser.photoURL : (hasGenericAvatar ? null : rev.avatar);


                  return (
                    <div key={idx} className="p-5 bg-brand-dark/[0.015] border border-brand-dark/5 rounded-xl space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedProfile({ isOpen: true, userId: rev.userId, author: displayAuthor, handle: displayHandle, avatar: displayAvatar, isLoadingBio: true })}>
                          {displayAvatar ? (
                            <img 
                              src={displayAvatar} 
                              alt={displayAuthor} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border border-brand-dark/10 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-sm border border-brand-dark/10 shrink-0">
                              {displayAuthor ? displayAuthor.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                          <div className="text-left leading-tight">
                            <p className="text-xs font-bold text-brand-dark">{displayAuthor}</p>
                            <p className="text-[10px] font-mono text-brand-dark/40 mt-0.5">{displayHandle}</p>
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
                        {currentUser?.uid === rev.userId && (
                          <button
                            onClick={() => handleDeleteReview(rev.id || idx.toString())}
                            className="flex items-center space-x-1 hover:text-red-600 text-brand-dark/40 font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer select-none border border-transparent hover:border-red-500/10"
                            title="Delete this item permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                  })
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
                  checkout buy option
                </h3>

                {/* Dynamic Price Tracker Info */}
                <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-4.5 rounded-xl flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center justify-between w-full">
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
                  <div className="border-t border-brand-dark/5 pt-1.5 text-left text-[9px] font-mono text-brand-dark/40 italic">
                    * Note: Price may be different in future
                  </div>
                </div>

                {/* Checkout Gateway Trigger */}
                <div className="pt-4 border-t border-brand-dark/5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(currentProduct);
                        navigate('/checkout');
                      }}
                      className="flex-1 bg-brand-primary hover:bg-brand-accent text-white py-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/10 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.98] select-none text-center"
                    >
                      <span>Buy Now — ${getTierPrice()} USD</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist?.(currentProduct)}
                      className={`w-14 shrink-0 border border-brand-dark/10 bg-brand-dark/[0.02] hover:bg-brand-dark/[0.05] rounded-xl flex items-center justify-center transition-all cursor-pointer hover:-translate-y-0.5 ${
                        wishlist.some((p) => p.id === currentProduct.id) ? "text-red-500" : "text-brand-dark/40"
                      }`}
                      title={wishlist.some((p) => p.id === currentProduct.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-5 h-5 ${wishlist.some((p) => p.id === currentProduct.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-brand-dark/45 font-mono text-center mt-2.5 leading-relaxed font-semibold">
                    Clicking opens our secure Google Form order and delivery gateway
                  </p>
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
                <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-2 rounded col-span-2">
                  <span className="text-brand-dark/40 block text-[9px] uppercase tracking-wider">Weight:</span>
                  <span className="font-semibold text-xs mt-0.5 block">{currentProduct.fileSize}</span>
                </div>
                <div className="bg-brand-dark/[0.015] border border-brand-dark/5 p-2 rounded col-span-2">
                  <span className="text-brand-dark/40 block text-[9px] uppercase tracking-wider">Release Date:</span>
                  <span className="font-semibold text-xs mt-0.5 block text-brand-primary">{currentProduct.releaseDate || "June 2, 2026"}</span>
                </div>
              </div>
            </div>

          </div>

        </div>



      </div>

      <AnimatePresence>
        {selectedProfile?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProfile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 text-brand-dark/40 hover:text-brand-dark hover:bg-black/5 p-2 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="relative">
                  {selectedProfile.avatar ? (
                    <img 
                      src={selectedProfile.avatar} 
                      alt={selectedProfile.author} 
                      className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full shadow-lg border-4 border-white flex items-center justify-center bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-3xl">
                      {selectedProfile.author ? selectedProfile.author.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Verified Author">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-brand-dark tracking-tight">{selectedProfile.author}</h3>
                  <p className="font-mono text-xs font-bold text-brand-primary">{selectedProfile.handle}</p>
                </div>
                
                <div className="pt-4 border-t border-black/5 w-full space-y-3 text-left">
                   <div className="bg-brand-dark/[0.02] p-4 rounded-xl border border-black/5 space-y-1">
                     <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/40">Bio</span>
                     <p className="text-xs font-medium text-brand-dark/80">{selectedProfile.isLoadingBio ? "Loading bio..." : (selectedProfile.bio || "No bio available.")}</p>
                   </div>
                   <div className="bg-brand-dark/[0.02] p-4 rounded-xl border border-black/5 space-y-1">
                     <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/40">Location</span>
                     <p className="text-xs font-medium text-brand-dark/80">{selectedProfile.isLoadingBio ? "Loading location..." : (selectedProfile.location || "Unknown")}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
