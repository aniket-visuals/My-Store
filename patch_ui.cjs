const fs = require('fs');
let code = fs.readFileSync('src/components/AccountPortal.tsx', 'utf-8');

const usernameField = `
                    <div className="mt-4">
                      <label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                        Username
                      </label>
                      <div className="relative">
                        <span className="text-black/30 absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold">@</span>
                        <input
                          type="text"
                          required
                          placeholder="alexmercer"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.02] focus:bg-white outline-none text-xs text-black focus:border-black/35 focus:ring-1 focus:ring-black/5 transition-all font-medium font-sans"
                        />
                      </div>
                    </div>
`;

code = code.replace(/<label className="block text-\[10px\] font-mono text-black\/50 uppercase tracking-widest mb-1\.5 font-bold">\s*Email Address\s*<\/label>/g, 
`<label className="block text-[10px] font-mono text-black/50 uppercase tracking-widest mb-1.5 font-bold">
                      {activeTab === "signin" ? "Email or Username" : "Email Address (Optional)"}
                    </label>`);

code = code.replace(/type="email"\s*required/g, `type={activeTab === "signin" ? "text" : "email"}\n                        required={activeTab === "signin"}`);

code = code.replace(/placeholder="alexmercer@gmail\.com"/g, `placeholder={activeTab === "signin" ? "alexmercer@gmail.com or username" : "alexmercer@gmail.com"}`);

code = code.replace(/<\/div>\s*\)\}\s*<div>\s*<label className="block text-\[10px\] font-mono text-black\/50/g, 
`</div>
                    </div>
                    ${usernameField}
                  )}

                  <div>
                    <label className="block text-[10px] font-mono text-black/50`);

fs.writeFileSync('src/components/AccountPortal.tsx', code);
