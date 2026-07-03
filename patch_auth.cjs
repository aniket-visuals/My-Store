const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf-8');

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

const newEmailSignIn = `
export const emailSignIn = async (emailOrUsername: string, password: string): Promise<User> => {
  try {
    let loginEmail = emailOrUsername;
    
    if (!emailOrUsername.includes("@")) {
      const docRef = doc(db, "usernames", emailOrUsername.toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        loginEmail = docSnap.data().email;
      } else {
        loginEmail = \`\${emailOrUsername.toLowerCase()}@editorshub.local\`;
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
    const user = userCredential.user;
    
    const isDummyEmail = loginEmail.endsWith("@editorshub.local");
    
    if (!isDummyEmail && !user.emailVerified) {
      await signOut(auth);
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    return user;
  } catch (error: any) {
    console.error("Email sign in error:", error);
    if (error.message === "EMAIL_NOT_VERIFIED") {
      throw error;
    }
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-email"
    ) {
      throw new Error("Email/Username or password is incorrect");
    }
    throw new Error("Email/Username or password is incorrect");
  }
};
`;

const initAuthStr = `
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const isDummyEmail = user.email?.endsWith("@editorshub.local");
      if (!isDummyEmail && !user.emailVerified) {
        await signOut(auth);
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
        return;
      }
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};
`;

code = code.replace(/export const initAuth = [\s\S]*?\}\);\n\};\n/g, initAuthStr + '\n');
code = code.replace(/\/\*\*[\s\n\*]*\* Standard Email\/Password Sign Up[\s\n\*]*\*\/[\s\n]*export const emailSignUp = [\s\S]*?\}\);\n    \}\n    throw error;\n  \}\n\};\n/g, checkUsernameStr + '\n/**\n * Standard Email/Password Sign Up\n */\n' + newEmailSignUp + '\n');
code = code.replace(/\/\*\*[\s\n\*]*\* Standard Email\/Password Sign In[\s\n\*]*\*\/[\s\n]*export const emailSignIn = [\s\S]*?\}\n    throw new Error\("Email or password is incorrect"\);\n  \}\n\};\n/g, '/**\n * Standard Email/Password Sign In\n */\n' + newEmailSignIn + '\n');

fs.writeFileSync('src/services/authService.ts', code);
