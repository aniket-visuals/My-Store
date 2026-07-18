const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const \[confirmModal, setConfirmModal\] = useState<\{ action: "Approve" \| "Reject", order: Order \} \| null>\(null\);/,
  `const [confirmModal, setConfirmModal] = useState<{ action: "Approve" | "Reject", order: Order } | null>(null);
  const [approvalMessageType, setApprovalMessageType] = useState<"default" | "custom">("default");
  const [customEmailSubject, setCustomEmailSubject] = useState("");
  const [customEmailBody, setCustomEmailBody] = useState("");`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
