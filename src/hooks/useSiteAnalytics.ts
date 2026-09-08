import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export function useSiteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Do not track admin routes to prevent skewing data
    if (location.pathname.startsWith('/admin')) return;

    const trackVisit = async () => {
      try {
        // Format date as YYYY-MM-DD for daily aggregation
        const today = new Date().toISOString().split('T')[0];
        const statRef = doc(db, 'site_stats', today);
        
        // Use a simple local storage flag to track unique visitors
        const visitorKey = 'eh_visitor_tracked_' + today;
        let isUnique = false;
        
        if (!localStorage.getItem(visitorKey)) {
          localStorage.setItem(visitorKey, 'true');
          isUnique = true;
        }

        // Fire and forget: atomically increment counters in Firestore
        await setDoc(statRef, {
          date: today,
          views: increment(1),
          uniqueVisitors: isUnique ? increment(1) : increment(0),
          lastUpdated: new Date().toISOString()
        }, { merge: true });
        
      } catch (error) {
        console.error("Failed to track analytics:", error);
      }
    };

    // Use a small timeout to avoid blocking the main thread during navigation
    const timeoutId = setTimeout(() => {
      trackVisit();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
}
