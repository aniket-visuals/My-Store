const fs = require('fs');

let portalCode = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');

// Replace the Google Sheets Card with an empty div or remove it
portalCode = portalCode.replace(
  /\{\/\* Sheets Connection Status \*\/\}[\s\S]*?(?=\{\/\* Database sync counts \*\/\})/,
  ''
);

// Replace the handleSyncToSheet button area inside the second card
portalCode = portalCode.replace(
  /<button\s+onClick=\{handleSyncToSheet\}[\s\S]*?<\/button>/,
  '<div className="w-full text-center text-[10px] text-black/40 font-mono">Sync disabled by Admin</div>'
);

// Remove "View other creator database registrations that will synchronize with Google Sheets."
portalCode = portalCode.replace(
  /View other creator database registrations that will synchronize with Google Sheets./,
  'View database registrations and manage users.'
);

// Remove the text about publishing to Google Sheets
portalCode = portalCode.replace(
  /All sync metrics can be published securely to Google Sheets\./,
  'Metrics are updated in real-time.'
);

// Remove the google sign in tip text
portalCode = portalCode.replace(
  /💡 <em>Tip: You can use the standard Google Sheets auth below to log in instantly!<\/em>/,
  '💡 <em>Tip: You can use the standard Google login to access your account instantly!</em>'
);

fs.writeFileSync('src/components/AccountPortal.tsx', portalCode);
