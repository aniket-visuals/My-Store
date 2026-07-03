const fs = require('fs');
let code = fs.readFileSync('src/components/AuthenticatedDashboard.tsx', 'utf-8');

code = code.replace(/import \{ motion, AnimatePresence \} from "motion\/react";/, 'import { motion, AnimatePresence } from "motion/react";\nimport { checkUsernameAvailability } from "../services/authService";');

// add states
code = code.replace(/const \[tempProfileHandle, setTempProfileHandle\] = useState\(""\);/, 'const [tempProfileHandle, setTempProfileHandle] = useState("");\n  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken" | "invalid">("idle");');

// add useEffect
const effectCode = `
  useEffect(() => {
    if (isEditingProfileDetails && tempProfileHandle.trim() && tempProfileHandle.trim() !== profileHandle) {
      if (!/^[a-zA-Z0-9_]+$/.test(tempProfileHandle.trim())) {
        setUsernameStatus("invalid");
        return;
      }
      setUsernameStatus("loading");
      const delayFn = setTimeout(async () => {
        try {
          const isAvailable = await checkUsernameAvailability(tempProfileHandle.trim());
          setUsernameStatus(isAvailable ? "available" : "taken");
        } catch (e) {
          setUsernameStatus("idle");
        }
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setUsernameStatus("idle");
    }
  }, [tempProfileHandle, isEditingProfileDetails, profileHandle]);
`;
code = code.replace(/const \[profilePhone, setProfilePhone\] = useState/, effectCode + '\n  const [profilePhone, setProfilePhone] = useState');

// update UI
const newHandleUI = `<div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
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
                            value={tempProfileHandle}
                            onChange={(e) => setTempProfileHandle(e.target.value)}
                            className={\`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-black/[0.02] hover:bg-black/[0.03] focus:bg-white outline-none text-xs text-brand-dark focus:ring-1 transition-all font-semibold \${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : usernameStatus === 'available' ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20' : 'border-black/10 focus:border-brand-primary focus:ring-brand-primary/20'}\`}
                            placeholder="ronaldrichards"
                          />
                        </div>
                      </div>`;
code = code.replace(/<div className="space-y-1\.5">\s*<label className="text-\[10px\] font-bold text-black\/40 uppercase tracking-wider">\s*Username\s*<\/label>\s*<div className="relative">\s*<span className="text-black\/30 absolute left-4 top-1\/2 -translate-y-1\/2 font-mono text-sm font-bold">@<\/span>[\s\S]*?<\/div>\s*<\/div>/, newHandleUI);

// Check before save
const newSave = `const handleSaveProfileDetails = async () => {
    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      triggerSuccess("Please choose a valid and available username");
      return;
    }
    setProfileName(tempProfileName);
    setProfileHandle(tempProfileHandle);
    setProfileLocation(tempProfileLocation);
    setProfileBioText(tempProfileBioText);
    localStorage.setItem("profile_name", tempProfileName);
    localStorage.setItem("profile_handle", tempProfileHandle);
    localStorage.setItem("profile_location", tempProfileLocation);
    localStorage.setItem("profile_bio_text", tempProfileBioText);
    setIsEditingProfileDetails(false);
    triggerSuccess("Profile details updated successfully!");
  };`;
code = code.replace(/const handleSaveProfileDetails = \(\) => \{[\s\S]*?triggerSuccess\("Profile details updated successfully!"\);\n  \};/, newSave);

fs.writeFileSync('src/components/AuthenticatedDashboard.tsx', code);
