const fs = require('fs');
let code = fs.readFileSync('src/components/AccountPortal.tsx', 'utf-8');

// add checkUsernameAvailability
code = code.replace(/import \{\s*googleSignIn,\s*emailSignIn,\s*emailSignUp,/g, 'import {\n  checkUsernameAvailability,\n  googleSignIn,\n  emailSignIn,\n  emailSignUp,');

// add const [username, setUsername] = useState("");
code = code.replace(/const \[name, setName\] = useState\(""\);\n\s*const \[email, setEmail\] = useState\(""\);/g, 'const [name, setName] = useState("");\n  const [username, setUsername] = useState("");\n  const [email, setEmail] = useState("");');

const newHandleEmailSignUpStep1 = `
  const handleEmailSignUpStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("Please enter a username");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setErrorMsg("Username can only contain letters, numbers, and underscores");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const isAvailable = await checkUsernameAvailability(username.trim());
      if (!isAvailable) {
        setErrorMsg("Username is already taken");
        setIsLoading(false);
        return;
      }
      setIsSettingUpProfile(true);
    } catch (error) {
      setErrorMsg("Failed to check username availability");
    } finally {
      setIsLoading(false);
    }
  };
`;

code = code.replace(/const handleEmailSignUpStep1 = \(e: React\.FormEvent\) => \{[\s\S]*?setIsSettingUpProfile\(true\);\n  \};\n/g, newHandleEmailSignUpStep1);

const newHandleEmailSignUpFinal = `
  const handleEmailSignUpFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      localStorage.setItem("profile_location", setupLocation);
      localStorage.setItem("profile_bio_text", setupBio);
      localStorage.setItem("profile_name", name);
      localStorage.setItem("profile_handle", username.trim());
      
      const signupEmail = email.trim() || \`\${username.trim()}@editorshub.local\`;
      
      await emailSignUp(signupEmail, password, name, username.trim());
      
      if (!signupEmail.endsWith("@editorshub.local")) {
        setUnverifiedEmail(signupEmail);
      } else {
        setSuccessMsg("Account created successfully! Please sign in.");
        setTimeout(() => {
          setActiveTab("signin");
          setIsSettingUpProfile(false);
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };
`;

code = code.replace(/const handleEmailSignUpFinal = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsLoading\(false\);\n    \}\n  \};\n/g, newHandleEmailSignUpFinal);

fs.writeFileSync('src/components/AccountPortal.tsx', code);
