const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `        // Hardcoded admin email for security
        const adminEmails = ["aniketrajcargal123@gmail.com"];
        setIsAdmin(adminEmails.includes(user.email));`,
  `        // Check admins collection
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, "admins", user.uid)).then(adminDoc => {
            setIsAdmin(adminDoc.exists());
          });
        });`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
