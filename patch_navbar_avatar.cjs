const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');

code = code.replace(/const getUserAvatarUrl = \(\) => \{\n    if \(auth\.currentUser\?\.photoURL\) return auth\.currentUser\.photoURL;\n    return null;\n  \};/, `const getUserAvatarUrl = () => {
    const selectedAvatarKey = localStorage.getItem("profile_selected_avatar");
    const localAvatarUrl = getProfileAvatarUrl(selectedAvatarKey);
    return localAvatarUrl || auth.currentUser?.photoURL || null;
  };`);

code = code.replace(/import \{ Link, useNavigate \} from "react-router-dom";/, 'import { Link, useNavigate } from "react-router-dom";\nimport { getProfileAvatarUrl } from "../utils";');

fs.writeFileSync('src/components/Navbar.tsx', code);
