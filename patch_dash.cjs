const fs = require('fs');
let code = fs.readFileSync('src/components/AuthenticatedDashboard.tsx', 'utf-8');

// Add profileHandle state
code = code.replace(/const \[profileName, setProfileName\] = useState\(\(\) => \{[\s\S]*?\}\);/,
`const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("profile_name") || "Ronald Richards";
  });
  const [profileHandle, setProfileHandle] = useState(() => {
    return localStorage.getItem("profile_handle") || "ronaldrichards";
  });
  const [tempProfileHandle, setTempProfileHandle] = useState("");
`);

// update temp states in handle edit
code = code.replace(/setTempProfileName\(profileName\);/, `setTempProfileName(profileName);\n                          setTempProfileHandle(profileHandle);`);

// update save details
code = code.replace(/setProfileName\(tempProfileName\);/, `setProfileName(tempProfileName);\n    setProfileHandle(tempProfileHandle);`);
code = code.replace(/localStorage\.setItem\("profile_name", tempProfileName\);/, `localStorage.setItem("profile_name", tempProfileName);\n    localStorage.setItem("profile_handle", tempProfileHandle);`);

// update UI grid
const newGridItem = `
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                            Username
                          </p>
                          <p className="text-xs font-medium text-black/80 truncate">
                            @{profileHandle}
                          </p>
                        </div>
`;
code = code.replace(/<div className="space-y-1">\s*<p className="text-\[10px\] font-bold text-black\/40 uppercase tracking-wider">\s*Email\s*<\/p>/, newGridItem + `<div className="space-y-1">\n                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">\n                            Email\n                          </p>`);

// add it to form
const newFormItem = `
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                          Username
                        </label>
                        <div className="relative">
                          <span className="text-black/30 absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold">@</span>
                          <input
                            type="text"
                            value={tempProfileHandle}
                            onChange={(e) => setTempProfileHandle(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-black/[0.02] hover:bg-black/[0.03] focus:bg-white outline-none text-xs text-brand-dark focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all font-semibold"
                            placeholder="ronaldrichards"
                          />
                        </div>
                      </div>
`;
code = code.replace(/<div className="space-y-1\.5">\s*<label className="text-\[10px\] font-bold text-black\/40 uppercase tracking-wider">\s*Full Name\s*<\/label>[\s\S]*?<\/div>\s*<div className="space-y-2">\s*<label className="text-\[10px\] font-bold text-black\/40 uppercase tracking-wider">\s*Location \/ Country/g, (match) => match.replace(/<\/div>\s*<div className="space-y-2">/, '</div>\n' + newFormItem + '\n<div className="space-y-2">'));

// fix 3 columns to 4 or flex wrap, wait 3 cols is fine if there are 4 items it just goes to next row
fs.writeFileSync('src/components/AuthenticatedDashboard.tsx', code);
