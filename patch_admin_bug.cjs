const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `        // Check admins collection
        getDoc(doc(db, "admins", user.uid)).then(adminDoc => {
          setIsAdmin(adminDoc.exists());
        }).catch(() => setIsAdmin(false));
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setAuthLoading(false);`,
  `        // Check admins collection
        getDoc(doc(db, "admins", user.uid)).then(adminDoc => {
          setIsAdmin(adminDoc.exists() || user.email === 'aniketrajcargal123@gmail.com');
          setAuthLoading(false);
        }).catch(() => {
          setIsAdmin(user.email === 'aniketrajcargal123@gmail.com');
          setAuthLoading(false);
        });
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setAuthLoading(false);
      }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
