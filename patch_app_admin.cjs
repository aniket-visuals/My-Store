const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `        setUserEmail(user.email || "");
        
        try {
          const docRef = doc(db, "users", user.uid);`,
  `        setUserEmail(user.email || "");
        
        // Auto-bootstrap original admin
        if (user.email === 'aniketrajcargal123@gmail.com') {
          try {
            await setDoc(doc(db, "admins", user.uid), { email: user.email, role: 'admin' }, { merge: true });
          } catch (e) {
            console.error("Failed to bootstrap admin:", e);
          }
        }
        
        try {
          const docRef = doc(db, "users", user.uid);`
);

fs.writeFileSync('src/App.tsx', code);
