const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  `    match /admins/{adminId} {
      // 3. Replace email-based admin verification with a maintainable approach
      // Allow users to check if their own admin document exists without permission errors
      allow read: if request.auth != null && request.auth.uid == adminId;
      // Only existing admins can add other admins (or do it via Firebase Console)
      allow write: if isAdmin();
    }`,
  `    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if isAdmin() || (request.auth != null && request.auth.token.email == 'aniketrajcargal123@gmail.com');
    }`
);

fs.writeFileSync('firestore.rules', code);
