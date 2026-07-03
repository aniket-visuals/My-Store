const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf-8');

const newCode = `    const cleanAuthor = currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous";
    let formattedHandle = "@" + cleanAuthor.toLowerCase().replace(/[^a-z0-9_]/g, "");
    
    // Fetch real handle
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().username) {
        formattedHandle = "@" + userDocSnap.data().username;
      } else {
        const localHandle = localStorage.getItem("profile_handle");
        if (localHandle) {
          formattedHandle = "@" + localHandle.replace(/[^a-zA-Z0-9_]/g, "");
        }
      }
    } catch (e) {
      console.error("Failed to fetch user handle", e);
    }
`;

code = code.replace(/const cleanAuthor = [\\s\\S]*?const formattedHandle = [\\s\\S]*?;/, newCode);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
