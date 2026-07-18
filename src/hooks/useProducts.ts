import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Product, AdminProduct } from "../types";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), where("status", "==", "Published"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedProducts = snapshot.docs.map(doc => {
          const data = doc.data() as AdminProduct;
          return {
            id: doc.id,
            name: data.name,
            slug: data.slug,
            price: data.priceUsd,
            priceInr: data.priceInr,
            originalPrice: data.priceUsd * 1.5,
            category: data.category,
            rating: 5.0,
            reviewsCount: 0,
            downloadCount: 0,
            description: data.shortDescription || data.fullDescription || "",
            fullDescription: data.fullDescription,
            features: [],
            compatibility: "Any NLE",
            fileSize: data.fileSize || "N/A",
            commercialRights: data.commercialRights || false,
            faqs: data.faqs || [],
            fileType: "ZIP",
            image: data.thumbnail,
            galleryImages: data.galleryImages || [],
            videoPreview: data.previewVideo,
            downloadLink: data.downloadLink,
            tutorialLink: data.tutorialLink,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            isPopular: false,
            releaseDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()
          } as Product;
        });
        setProducts(fetchedProducts);
      } else {
        // Fallback to static data if no products in DB
        setProducts([])
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
};
