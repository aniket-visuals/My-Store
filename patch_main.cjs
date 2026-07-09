const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

if (!code.includes('ErrorBoundary')) {
  code = code.replace(
    `import App from './App.tsx';`,
    `import App from './App.tsx';\nimport ErrorBoundary from './components/ErrorBoundary';`
  );
  code = code.replace(
    `<BrowserRouter>\n      <App />\n    </BrowserRouter>`,
    `<ErrorBoundary>\n      <BrowserRouter>\n        <App />\n      </BrowserRouter>\n    </ErrorBoundary>`
  );
  fs.writeFileSync('src/main.tsx', code);
}
