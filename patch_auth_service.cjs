const fs = require('fs');

let authService = fs.readFileSync('src/services/authService.ts', 'utf8');

authService = authService.replace(
  /sendPasswordResetEmail,\n\s*User,/,
  'sendPasswordResetEmail,\n  fetchSignInMethodsForEmail,\n  User,'
);

authService += `
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    return false;
  }
};
`;

fs.writeFileSync('src/services/authService.ts', authService);
