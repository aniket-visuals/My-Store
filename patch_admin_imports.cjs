const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /import \{ collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc \} from "firebase\/firestore";/,
  'import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, deleteDoc, setDoc } from "firebase/firestore";'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
