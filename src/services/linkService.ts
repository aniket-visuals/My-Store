import { db } from "../firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  increment 
} from "firebase/firestore";

export interface CloakedLink {
  slug: string;
  originalUrl: string;
  title?: string;
  clicks: number;
  createdAt: string;
  updatedAt?: string;
  lastClickedAt?: string;
}

const COLLECTION_NAME = "redirects";

export const getCloakedLinks = async (): Promise<CloakedLink[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const links: CloakedLink[] = [];
    snapshot.forEach((d) => {
      links.push(d.data() as CloakedLink);
    });
    return links;
  } catch (error) {
    console.error("Error fetching cloaked links:", error);
    // Fallback if index on createdAt is building
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const links: CloakedLink[] = [];
      snapshot.forEach((d) => {
        links.push(d.data() as CloakedLink);
      });
      return links.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (fallbackError) {
      console.error("Fallback error fetching cloaked links:", fallbackError);
      return [];
    }
  }
};

export const getCloakedLink = async (slug: string): Promise<CloakedLink | null> => {
  try {
    const cleanSlug = slug.trim().toLowerCase();
    const docRef = doc(db, COLLECTION_NAME, cleanSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CloakedLink;
    }
    return null;
  } catch (error) {
    console.error("Error getting cloaked link:", error);
    return null;
  }
};

export const recordLinkClick = async (slug: string): Promise<void> => {
  try {
    const cleanSlug = slug.trim().toLowerCase();
    const docRef = doc(db, COLLECTION_NAME, cleanSlug);
    await updateDoc(docRef, {
      clicks: increment(1),
      lastClickedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn("Could not increment click count:", error);
  }
};

export const saveCloakedLink = async (linkData: {
  slug: string;
  originalUrl: string;
  title?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const cleanSlug = linkData.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug) {
      return { success: false, error: "Invalid slug. Use only letters, numbers, and dashes." };
    }

    let url = linkData.originalUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      new URL(url);
    } catch {
      return { success: false, error: "Please enter a valid destination URL." };
    }

    const docRef = doc(db, COLLECTION_NAME, cleanSlug);
    const existing = await getDoc(docRef);

    const now = new Date().toISOString();
    const newDoc: CloakedLink = {
      slug: cleanSlug,
      originalUrl: url,
      title: linkData.title?.trim() || cleanSlug,
      clicks: existing.exists() ? (existing.data().clicks || 0) : 0,
      createdAt: existing.exists() ? (existing.data().createdAt || now) : now,
      updatedAt: now,
    };

    await setDoc(docRef, newDoc);
    return { success: true };
  } catch (error: any) {
    console.error("Error saving cloaked link:", error);
    return { success: false, error: error.message || "Failed to save link" };
  }
};

export const deleteCloakedLink = async (slug: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const cleanSlug = slug.trim().toLowerCase();
    await deleteDoc(doc(db, COLLECTION_NAME, cleanSlug));
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting cloaked link:", error);
    return { success: false, error: error.message || "Failed to delete link" };
  }
};
