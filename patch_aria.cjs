const fs = require('fs');

const addAriaLabels = (file) => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Add aria-labels to common icon buttons
    code = code.replace(/<button onClick=\{\(\) => setScreenshotModal\(null\)\} className="absolute/g, '<button aria-label="Close screenshot modal" onClick={() => setScreenshotModal(null)} className="absolute');
    code = code.replace(/<button onClick=\{\(\) => navigate\("\/"\)\} className="p-2 -ml-2 rounded-lg/g, '<button aria-label="Go back" onClick={() => navigate("/")} className="p-2 -ml-2 rounded-lg');
    
    fs.writeFileSync(file, code);
  }
};

addAriaLabels('src/components/AdminDashboard.tsx');

const addCheckoutAria = (file) => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/<button\s+onClick=\{\(\) => navigate\(-1\)\}\s+className="flex items-center space-x-2/g, '<button aria-label="Go back" onClick={() => navigate(-1)} className="flex items-center space-x-2');
    fs.writeFileSync(file, code);
  }
}
addCheckoutAria('src/components/CheckoutPage.tsx');

