import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

import { StoreCategory } from "../types";

export const useCategories = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("displayOrder", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories: StoreCategory[] = [];
      snapshot.forEach(doc => {
        fetchedCategories.push({ id: doc.id, ...doc.data() } as StoreCategory);
      });
      setCategories(fetchedCategories);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { categories, loading };
};
