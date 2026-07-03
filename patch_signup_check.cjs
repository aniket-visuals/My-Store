const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf-8');

const newEmailSignUp = `export const emailSignUp = async (email: string, password: string, displayName: string, username: string = ""): Promise<User> => {
  try {
    if (username) {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error("Username is already taken");
      }
    }

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
};`;

code = code.replace(/export const emailSignUp = async \([\s\S]*?throw error;\n  \}\n\};\n/g, newEmailSignUp + '\n');
fs.writeFileSync('src/services/authService.ts', code);
