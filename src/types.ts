export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceInr?: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewsCount: number;
  downloadCount: number;
  description: string;
  fullDescription?: string;
  features: string[];
  compatibility: string;
  fileSize: string;
  fileType: string;
  image: string;
  galleryImages?: string[];
  videoPreview?: string;
  audioPreview?: string;
  downloadLink?: string;
  tutorialLink?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPopular?: boolean;
  faqs?: FaqItem[];
  fileSize?: string;
  commercialRights?: boolean;
  releaseDate?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  thumbnail: string;
  galleryImages: string[];
  previewVideo?: string;
  status: "Published" | "Draft";
  priceUsd: number;
  priceInr: number;
  downloadLink: string;
  tutorialLink?: string;
  metaTitle?: string;
  metaDescription?: string;
  emailSubject?: string;
  emailBody?: string;
  fileSize?: string;
  commercialRights?: boolean;
  faqs?: FaqItem[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  assetCount: number;
  gradient: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  handle: string;
  avatar: string;
  comment: string;
  rating: number;
  verified: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  creator: string;
  thumbnail: string;
  videoMockUrl: string;
  likes: number;
  views: number;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  subLabel: string;
}
