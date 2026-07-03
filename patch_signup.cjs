const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf-8');

const oldStr = `/**
 * Standard Email/Password Sign Up
 */
export const emailSignUp = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
        
    // Update display name
    await updateProfile(user, { displayName });

    // Send verification email
    await sendEmailVerification(user);
    
    // Sign out immediately so they are not signed in automatically
    await signOut(auth);

    return user;
  } catch (error: any) {
    console.error("Email sign up error:", error);
    if (error.code === "auth/email-already-in-use") {
      throw new Error("User already exists. Please sign in");
    }
    throw error;
  }
};`;

const checkUsernameStr = `
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (!username) return false;
  try {
    const docRef = doc(db, "usernames", username.toLowerCase());
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
};
`;

const newEmailSignUp = `
export const emailSignUp = async (email: string, password: string, displayName: string, username: string = ""): Promise<User> => {
  try {
    const isDummyEmail = email.endsWith("@editorshub.local");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName });

    if (username) {
      await setDoc(doc(db, "usernames", username.toLowerCase()), {
        email,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      
      await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase(),
        displayName,
        email,
        createdAt: serverTimestamp()
      });
    }

    if (!isDummyEmail) {
      await sendEmailVerification(user);
    }
    
    await signOut(auth);

    return user;
  } catch (error: any) {
    console.error("Email sign up error:", error);
    if (error.code === "auth/email-already-in-use") {
      throw new Error("User already exists. Please sign in");
    }
    throw error;
  }
};
`;

// use regex because of spacing issues
code = code.replace(/\/\*\*[\s\S]*?\* Standard Email\/Password Sign Up[\s\S]*?throw error;\n  \}\n\};\n/g, checkUsernameStr + '\n/**\n * Standard Email/Password Sign Up\n */\n' + newEmailSignUp + '\n');
fs.writeFileSync('src/services/authService.ts', code);
