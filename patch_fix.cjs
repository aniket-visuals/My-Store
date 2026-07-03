const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf-8');

const missingFunction = `/**
 * Perform Google Sign-In and fetch access token for Google Sheets API
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn("No Google Sheets access token returned; checking if already authenticated or fallback.");
    }
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken || "" };
  } catch (error: any) {
    console.error("Google Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};
`;

code = code.replace(/export const checkUsernameAvailability/g, missingFunction + '\nexport const checkUsernameAvailability');
fs.writeFileSync('src/services/authService.ts', code);
