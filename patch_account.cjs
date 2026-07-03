const fs = require('fs');
let code = fs.readFileSync('src/components/AccountPortal.tsx', 'utf-8');

// add state
code = code.replace(/const \[username, setUsername\] = useState\(""\);/, 'const [username, setUsername] = useState("");\n  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken" | "invalid">("idle");');

// add useEffect
const effectCode = `
  useEffect(() => {
    if (activeTab === "signup" && username.trim()) {
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        setUsernameStatus("invalid");
        return;
      }
      setUsernameStatus("loading");
      const delayFn = setTimeout(async () => {
        try {
          const isAvailable = await checkUsernameAvailability(username.trim());
          setUsernameStatus(isAvailable ? "available" : "taken");
        } catch (e) {
          setUsernameStatus("idle");
        }
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setUsernameStatus("idle");
    }
  }, [username, activeTab]);
`;
code = code.replace(/useEffect\(\(\) => \{\n    const unsubscribe = initAuth/, effectCode + '\n  useEffect(() => {\n    const unsubscribe = initAuth');

// add check in handleEmailSignUpStep1
code = code.replace(/const handleEmailSignUpStep1 = async \(e: React.FormEvent\) => \{[\s\S]*?if \(!\/^[a-zA-Z0-9_]+\$\/\.test\(username\.trim\(\)\)\) \{[\s\S]*?return;\n    \}/, (match) => match + '\n    if (usernameStatus === "taken") {\n      setErrorMsg("Username is already taken");\n      return;\n    }\n    if (usernameStatus === "invalid") {\n      setErrorMsg("Username can only contain letters, numbers, and underscores");\n      return;\n    }');

// change UI
const newUsernameField = `                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest font-bold">
                          Username
                        </label>
                        {usernameStatus === 'loading' && <span className="text-[10px] text-brand-primary font-bold">Checking...</span>}
                        {usernameStatus === 'available' && <span className="text-[10px] text-emerald-500 font-bold">Available!</span>}
                        {usernameStatus === 'taken' && <span className="text-[10px] text-red-500 font-bold">Username taken</span>}
                        {usernameStatus === 'invalid' && <span className="text-[10px] text-red-500 font-bold">Letters, numbers, underscores only</span>}
                      </div>
                      <div className="relative">
                        <span className="text-black/30 absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold">@</span>
                        <input
                          type="text"
                          required
                          placeholder="alexmercer"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={\`w-full pl-10 pr-4 py-3 rounded-xl border bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:ring-1 transition-all font-medium font-sans \${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : usernameStatus === 'available' ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20' : 'border-black/10 focus:border-black/35 focus:ring-black/5'}\`}
                        />
                      </div>
                    </div>`;

code = code.replace(/<div className="mt-4">\s*<label className="block text-\[10px\] font-mono text-black\/50 uppercase tracking-widest mb-1\.5 font-bold">\s*Username\s*<\/label>\s*<div className="relative">\s*<span className="text-black\/30 absolute left-4 top-1\/2 -translate-y-1\/2 font-mono text-sm font-bold">@<\/span>[\s\S]*?<\/div>\s*<\/div>/, newUsernameField);

fs.writeFileSync('src/components/AccountPortal.tsx', code);
