const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const earlyReturns = `  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }`;

code = code.replace(earlyReturns, '');

code = code.replace(
  `  const showToast = (message: string, type: "success" | "error") => {`,
  `${earlyReturns}

  const showToast = (message: string, type: "success" | "error") => {`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
