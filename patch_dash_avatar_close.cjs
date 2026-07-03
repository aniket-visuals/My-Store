const fs = require('fs');
let code = fs.readFileSync('src/components/AuthenticatedDashboard.tsx', 'utf-8');

// For the first one:
code = code.replace(/<div\n              onClick=\{\(\) => setActiveSidebarTab\("edit-profile"\)\}\n              className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-\[10px\] border border-black\/10 cursor-pointer select-none"\n            >\n              \{profileName \? profileName\.charAt\(0\)\.toUpperCase\(\) : "U"\}\n            <\/div>\n          \)\}/, `<div
              onClick={() => setActiveSidebarTab("edit-profile")}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-[10px] border border-black/10 cursor-pointer select-none"
            >
              {profileName ? profileName.charAt(0).toUpperCase() : "U"}
            </div>
          );})()}`);


code = code.replace(/<div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-4xl">\n                        \{profileName \? profileName\.charAt\(0\)\.toUpperCase\(\) : "U"\}\n                      <\/div>\n                    \)\}/, `<div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-gradient-to-br from-brand-primary to-indigo-600 text-white font-sans font-black text-4xl">
                        {profileName ? profileName.charAt(0).toUpperCase() : "U"}
                      </div>
                    );})()}`);


fs.writeFileSync('src/components/AuthenticatedDashboard.tsx', code);
