const fs = require('fs');
let code = fs.readFileSync('src/components/AuthenticatedDashboard.tsx', 'utf-8');

// Replace the first occurrence (sidebar top)
code = code.replace(/\{user\?\.photoURL \? \(\n            <img\n              src=\{user\.photoURL\}/, `{(() => {
            const avatarSrc = getUserAvatarUrl(selectedAvatar) || user?.photoURL;
            return avatarSrc ? (
            <img
              src={avatarSrc}`);

code = code.replace(/\{user\?\.photoURL \? \(\n                      <div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-black\/\[0\.02\]">\n                        <img\n                          src=\{user\.photoURL\}/, `{(() => {
                    const avatarSrc = getUserAvatarUrl(selectedAvatar) || user?.photoURL;
                    return avatarSrc ? (
                      <div className="w-28 h-28 rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-white bg-black/[0.02]">
                        <img
                          src={avatarSrc}`);

fs.writeFileSync('src/components/AuthenticatedDashboard.tsx', code);
