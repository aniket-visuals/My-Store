const fs = require('fs');
const newRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Function to check if the user is an admin
    function isAdmin() {
      return request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Orders Collection
    match /orders/{orderId} {
      // 1. Do not allow anonymous users to create fake orders.
      // 5. Ensure valid data is provided to prevent spam.
      allow create: if request.auth != null 
                    && request.resource.data.keys().hasAll(['customerName', 'email', 'productId', 'amount', 'paymentScreenshotUrl', 'userId'])
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.paymentScreenshotUrl.matches('^https://res\\\\.cloudinary\\\\.com/.*');
      
      // Only authenticated admins can read, update, or delete orders
      allow read, update, delete: if isAdmin();
    }
    
    // Counters Collection (needed for order ID generation transaction)
    match /counters/{counterId} {
      // 2. Remove public write access from counters collection
      allow read: if request.auth != null;
      // 4. Ensure sequential order IDs remain secure by enforcing +1 increment
      allow update: if request.auth != null 
                    && request.resource.data.count == resource.data.count + 1;
      allow create: if request.auth != null 
                    && request.resource.data.count == 1;
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
      // 3. Replace email-based admin verification with a maintainable approach
      // Allow users to check if their own admin document exists without permission errors
      allow read: if request.auth != null && request.auth.uid == adminId;
      // Only existing admins can add other admins (or do it via Firebase Console)
      allow write: if isAdmin();
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
