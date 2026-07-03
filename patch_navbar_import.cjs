const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');

code = code.replace(/import \{ auth \} from "\.\.\/firebase";/, 'import { auth } from "../firebase";\nimport { getProfileAvatarUrl } from "../utils";');

fs.writeFileSync('src/components/Navbar.tsx', code);
