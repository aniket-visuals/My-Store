export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewsCount: number;
  downloadCount: number;
  description: string;
  features: string[];
  compatibility: string;
  fileSize: string;
  fileType: string;
  image: string;
  videoPreview?: string;
  audioPreview?: string;
  isPopular?: boolean;
  releaseDate?: string;
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
