const fs = require('fs');

let code = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');

const regex = /const signupEmail = email.trim\(\) \|\| \`\$\{username.trim\(\)\}@editorshub.local\`;\s*const emailExists = await checkEmailExists\(signupEmail\);\s*if \(emailExists\) \{\s*setErrorMsg\("User already exists. Please sign in"\);\s*setIsLoading\(false\);\s*return;\s*\}\s*const isAvailable = await checkUsernameAvailability\(username.trim\(\)\);/g;

let count = 0;
code = code.replace(regex, (match) => {
  count++;
  if (count === 1) {
    // First match is the useEffect
    return "const isAvailable = await checkUsernameAvailability(username.trim());";
  } else {
    // Second match is handleEmailSignUpStep1
    return match;
  }
});

fs.writeFileSync('src/components/AccountPortal.tsx', code);
