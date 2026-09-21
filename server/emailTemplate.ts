export function generateHtmlEmail({
  subject,
  body,
  storeUrl = "https://editorshubstore.in",
  supportEmail = "admin@editorshubstore.in",
}: {
  subject: string;
  body: string;
  storeUrl?: string;
  supportEmail?: string;
}): string {
  // Convert plain text body into clean HTML blocks
  // Find URLs in text and format them properly
  const paragraphs = body
    .split(/\r?\n\r?\n/)
    .map(p => p.trim())
    .filter(Boolean);

  let formattedContent = "";

  for (const para of paragraphs) {
    const lines = para.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    // Check if this paragraph contains a raw download link
    const downloadLine = lines.find(l => l.startsWith("http://") || l.startsWith("https://"));
    
    if (downloadLine && (downloadLine.includes("mega.nz") || downloadLine.includes("drive.google.com") || downloadLine.includes("mediafire.com") || lines.some(l => l.toLowerCase().includes("download")))) {
      const labelLine = lines.find(l => l !== downloadLine) || "Access Digital Content";
      formattedContent += `
        <div style="margin: 24px 0; padding: 20px; background-color: #fff7f2; border: 1px solid #ffd8c2; border-radius: 12px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #1c1917;">${escapeHtml(labelLine)}</p>
          <a href="${escapeHtml(downloadLine)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f95a14; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(249, 90, 20, 0.2);">
            Download Files
          </a>
        </div>
      `;
    } else {
      // Normal paragraph
      const formattedLines = lines.map(line => {
        // Format any inline URLs
        return escapeHtml(line).replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #f95a14; text-decoration: underline;">$1</a>'
        );
      }).join("<br/>");

      formattedContent += `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">${formattedLines}</p>`;
    }
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e4e4e7;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 28px 32px; text-align: left; border-bottom: 3px solid #f95a14;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-transform: uppercase;">
                      EDITORS HUB <span style="color: #f95a14;">STORE</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; background-color: rgba(249, 90, 20, 0.15); border: 1px solid rgba(249, 90, 20, 0.3); border-radius: 20px; font-size: 12px; font-weight: 600; color: #f95a14;">
                      Order Delivery
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              ${formattedContent}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #e4e4e7;"></div>
            </td>
          </tr>

          <!-- Support & Info Box -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 13px; color: #71717a; line-height: 1.5;">
                    Need help with your download? Reply directly to this email or reach us at 
                    <a href="mailto:${supportEmail}" style="color: #f95a14; text-decoration: none; font-weight: 500;">${supportEmail}</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} Editors Hub Store. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                <a href="${storeUrl}" style="color: #71717a; text-decoration: underline;">Visit Store</a> &bull; 
                <a href="${storeUrl}/privacy-policy" style="color: #71717a; text-decoration: underline;">Privacy Policy</a> &bull; 
                <a href="${storeUrl}/terms" style="color: #71717a; text-decoration: underline;">Terms & Conditions</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
