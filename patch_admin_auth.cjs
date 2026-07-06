const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Navigate, useNavigate } from "react-router-dom";`,
  `import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";`
);

code = code.replace(
  `  const [searchTerm, setSearchTerm] = useState("");`,
  `  const [searchTerm, setSearchTerm] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);`
);

code = code.replace(
  `  // Simple auth check - could be expanded to check custom claims for admin
  if (!auth.currentUser) {
    return <Navigate to="/portal" replace />;
  }`,
  `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
