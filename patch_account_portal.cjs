const fs = require('fs');

let code = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');

const regex = /const isAvailable = await checkUsernameAvailability\(username\.trim\(\)\);/g;

code = code.replace(regex, `const signupEmail = email.trim() || \`\${username.trim()}@editorshub.local\`;
      const emailExists = await checkEmailExists(signupEmail);
      if (emailExists) {
        setErrorMsg("User already exists. Please sign in");
        setIsLoading(false);
        return;
      }
      
      const isAvailable = await checkUsernameAvailability(username.trim());`);

fs.writeFileSync('src/components/AccountPortal.tsx', code);
