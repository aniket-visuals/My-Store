const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";`,
  `import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";`
);

code = code.replace(
  `        // Check admins collection
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, "admins", user.uid)).then(adminDoc => {
            setIsAdmin(adminDoc.exists());
          });
        });`,
  `        // Check admins collection
        getDoc(doc(db, "admins", user.uid)).then(adminDoc => {
          setIsAdmin(adminDoc.exists());
        }).catch(() => setIsAdmin(false));`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
