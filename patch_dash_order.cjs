const fs = require('fs');
let code = fs.readFileSync('src/components/AuthenticatedDashboard.tsx', 'utf-8');

// extract the useEffect
const useEffectRegex = /\s*useEffect\(\(\) => \{\n\s*if \(isEditingProfileDetails[\s\S]*?\}, \[tempProfileHandle, isEditingProfileDetails, profileHandle\]\);/g;
const effectMatch = code.match(useEffectRegex);

if (effectMatch) {
  code = code.replace(effectMatch[0], ''); // remove it
  
  // place it after isEditingProfileDetails
  const insertTarget = 'const [isEditingProfileDetails, setIsEditingProfileDetails] = useState(false);';
  code = code.replace(insertTarget, insertTarget + effectMatch[0]);
  
  fs.writeFileSync('src/components/AuthenticatedDashboard.tsx', code);
}
