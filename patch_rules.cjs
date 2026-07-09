const fs = require('fs');
const newRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Function to check if the user is an admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'aniketrajcargal123@gmail.com';
    }

    // Orders Collection
    match /orders/{orderId} {
      // Customers can only create new orders
      allow create: if true;
      // Only authenticated admins can read, update, or delete orders
      allow read, update, delete: if isAdmin();
    }
    
    // Counters Collection (needed for order ID generation transaction)
    match /counters/{counterId} {
      allow read, write: if true;
    }

    // Products Collection
    match /products/{productId} {
      allow read: if true; // Public can read products
      allow write: if isAdmin(); // Only admins can modify
    }

    // Protect settings, analytics, and admin collections
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
    
    match /analytics/{analyticId} {
      allow read, write: if isAdmin();
    }
    
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }

    // User Profiles
    match /usernames/{username} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
`;
fs.writeFileSync('firestore.rules', newRules);
