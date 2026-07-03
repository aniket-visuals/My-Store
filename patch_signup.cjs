const fs = require('fs');

// Update authService.ts
let code = fs.readFileSync('src/services/authService.ts', 'utf-8');
code = code.replace(/export const emailSignUp = async \(email: string, password: string, displayName: string, username: string = ""\): Promise<User> => \{/, 'export const emailSignUp = async (email: string, password: string, displayName: string, username: string = "", bio: string = ""): Promise<User> => {');
code = code.replace(/await setDoc\(doc\(db, "users", user\.uid\), \{\n        username: username\.toLowerCase\(\),\n        displayName,\n        email,\n        createdAt: serverTimestamp\(\)\n      \}\);/, `await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase(),
        displayName,
        email,
        bio: bio || "No bio available.",
        createdAt: serverTimestamp()
      });`);
fs.writeFileSync('src/services/authService.ts', code);

// Update AccountPortal.tsx
let portalCode = fs.readFileSync('src/components/AccountPortal.tsx', 'utf-8');
portalCode = portalCode.replace(/await emailSignUp\(signupEmail, password, name, username\.trim\(\)\);/, 'await emailSignUp(signupEmail, password, name, username.trim(), setupBio);');
fs.writeFileSync('src/components/AccountPortal.tsx', portalCode);

