import { Category, Product, FeatureItem, Testimonial, PortfolioItem, FaqItem, StatItem } from "./types";

export const CATEGORIES_DATA: Category[] = [
  {
    id: "cat-sfx",
    name: "Sound Effects",
    slug: "sound-effects",
    description: "Immersive foley, atmospheric hits, deep impacts, and organic UI transitions designed to hook audiences.",
    iconName: "Volume2",
    assetCount: 42,
    gradient: "from-brand-accent to-brand-primary"
  }
];

export const PRODUCTS_DATA: Product[] = [
  {
    id: "p1",
    name: "MotionFX",
    price: 10,
    originalPrice: 19,
    category: "sound-effects",
    rating: 4.9,
    reviewsCount: 148,
    downloadCount: 0,
    description: "A premium collection of high-quality sound effects made for video editors and motion designers. Add more impact to your edits with professional sounds and enjoy **lifetime updates** at no extra cost.",
    features: ["Professional-quality sound effects", "Made for Video Editors & Motion Designers", "Organized & Easy to Use", "Lifetime Updates"],
    compatibility: "Any NLE (Premiere Pro, DaVinci Resolve, FCPX, CapCut, etc.)",
    fileSize: "1.4 GB",
    fileType: "WAV",
    image: "https://res.cloudinary.com/df5rgwdng/image/upload/v1780825245/Untitled_design_6_njcida.png",
    audioPreview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    isPopular: true
  }
];

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "f1",
    title: "Professional-Grade Assets",
    description: "Every asset is personally collected, tested, and curated by Aniket Visuals to meet top-tier industry standards. Perfect for high-end professional projects.",
    iconName: "Award"
  },
  {
    id: "f2",
    title: "Handpicked Collection",
    description: "An exclusive, handpicked selection of premium resources. No generic fillers—only high-conversion, rare assets that elevate your production value.",
    iconName: "Sparkles"
  },
  {
    id: "f3",
    title: "Fast Support",
    description: "Backed by lightning-fast support directly from Aniket Visuals. Get editor-to-editor assistance, helping you bypass any workflow roadblock in minutes.",
    iconName: "Zap"
  },
  {
    id: "f4",
    title: "Regular Updates",
    description: "Our library is consistently expanded and regularly updated with new additions, bug fixes, and optimization patches for the latest editing software versions.",
    iconName: "RefreshCw"
  },
  {
    id: "f5",
    title: "Built for Professional Work",
    description: "Engineered specifically for demanding production environments and tight client deadlines. Streamlined for modern, high-speed professional editing workflows.",
    iconName: "Briefcase"
  },
  {
    id: "f6",
    title: "Assets Used in My Livestreams",
    description: "Real-world tested under pressure. These are the exact, verified assets demonstrated live and integrated into Aniket Visuals' actual editing videos.",
    iconName: "Video"
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t1",
    name: "Marcus Vance",
    role: "Freelance Commercial Editor",
    handle: "@marcus_vanced",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    comment: "Editors Raj assets completely changed my speed. The Cinematic Whooshes pack and Helios LUTs have becomes a constant staple of my high-end commercial projects.",
    rating: 5,
    verified: true
  },
  {
    id: "t2",
    name: "Evelyn Reed",
    role: "Tech YouTuber (2.4M Subs)",
    handle: "@evelyncreative",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    comment: "Retention went up by 14% after integrating the Neptune Typography engine and the sound design library. The details look exceptionally premium.",
    rating: 5,
    verified: true
  },
  {
    id: "t3",
    name: "Kaelen Mercer",
    role: "Lead Motion Designer",
    handle: "@kae_renders",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    comment: "Being able to drop a ProRes Cyberpunk HUD file inside Premiere with transparency still preserved makes complex work feel like a simple walk in the park! Stellar products.",
    rating: 5,
    verified: true
  }
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: "port-1",
    title: "Commercial Concept Reel 2026",
    category: "Director's Cut",
    creator: "Editors Raj",
    thumbnail: "https://images.unsplash.com/photo-1492044715545-15ddedd84e5e?auto=format&fit=crop&w=800&q=80",
    videoMockUrl: "https://assets.mixkit.co/videos/preview/mixkit-urban-traffic-at-night-time-lapse-42289-large.mp4",
    likes: 852,
    views: 12400
  },
  {
    id: "port-2",
    title: "Synthwave Motion Design Loop",
    category: "3D Motion Graphics",
    creator: "Marcus R.",
    thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    videoMockUrl: "https://assets.mixkit.co/videos/preview/mixkit-spinning-retro-arcade-machine-glow-short-43224-large.mp4",
    likes: 1205,
    views: 18900
  },
  {
    id: "port-3",
    title: "Adventure Cinematics Mini-Doc",
    category: "Color & Sound Design",
    creator: "Julia Zhang",
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    videoMockUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-thick-forest-with-river-33120-large.mp4",
    likes: 934,
    views: 14200
  }
];

export const FAQ_DATA: FaqItem[] = [
  {
    id: "faq-1",
    question: "What products do you sell?",
    answer: "We offer professional sound effects, highly adjustable Premiere Pro and After Effects template rigs, cinematic color LUT tables (cube files), motion graphics overlays with transparency built-in, and high-retention graphic resources for graphic designers."
  },
  {
    id: "faq-2",
    question: "How do downloads work?",
    answer: "Directly after your payment completes, you'll receive a high-speed secure download link via email and on your post-purchase layout. You can also re-download your assets at any time by signing in or requesting a magic recovery code."
  },
  {
    id: "faq-3",
    question: "Are updates included?",
    answer: "Yes, completely! Any minor optimizations, bug fixes, or compatibility updates for newly released versions of Adobe Premiere or After Effects are sent to your inbox automatically and can be downloaded free for life."
  },
  {
    id: "faq-4",
    question: "Can I use assets commercially?",
    answer: "Absolutely. Every Single asset pack includes a perpetual commercial usage license. You can use them for personal videos, commercial YouTube clips, client reels, paid advertisements, and large production broadcasts."
  },
  {
    id: "faq-5",
    question: "What software is supported?",
    answer: "Our Sound effects (.wav) work on all audio and editing software. LUTs (.cube) work on Premiere, DaVinci Resolve, FCPX, Photoshop, and OBS. Our presets are specifically prepared for Premiere Pro and After Effects (version 2021+ is highly recommended)."
  }
];

export const STATS_DATA: StatItem[] = [
  {
    id: "s1",
    value: "0",
    label: "Active Community Members",
    subLabel: "Global creators trust us"
  },
  {
    id: "s2",
    value: "1",
    label: "Creative Asset Files",
    subLabel: "Handcrafted curated premium quality"
  },
  {
    id: "s3",
    value: "0",
    label: "Successful Downloads",
    subLabel: "Helping creators worldwide daily"
  },
  {
    id: "s4",
    value: "Regular",
    label: "Quality Updates",
    subLabel: "Tested inside current project suites"
  }
];
