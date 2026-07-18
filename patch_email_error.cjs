const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  /export const sendApprovalEmail = async \(params: EmailParams\): Promise<boolean> => \{/,
  `export const sendApprovalEmail = async (params: EmailParams): Promise<{ success: boolean; error?: string }> => {`
);

code = code.replace(
  /return response\.status === 200;/,
  `return { success: response.status === 200 };`
);

code = code.replace(
  /return false;/,
  `return { success: false, error: error?.text || error?.message || "Unknown error" };`
);

fs.writeFileSync('src/services/emailService.ts', code);
