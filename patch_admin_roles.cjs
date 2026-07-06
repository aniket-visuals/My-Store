const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `  const [isAuthenticated, setIsAuthenticated] = useState(false);`,
  `  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);`
);

code = code.replace(
  `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);`,
  `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setIsAuthenticated(true);
        // Hardcoded admin email for security
        const adminEmails = ["aniketrajcargal123@gmail.com"];
        setIsAdmin(adminEmails.includes(user.email));
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);`
);

code = code.replace(
  `  if (!isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }`,
  `  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
