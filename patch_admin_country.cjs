const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `{order.discordOrTelegramUsername && (
                          <div className="text-xs text-brand-primary mt-0.5">@{order.discordOrTelegramUsername}</div>
                        )}`,
  `{order.discordOrTelegramUsername && (
                          <div className="text-xs text-brand-primary mt-0.5">@{order.discordOrTelegramUsername}</div>
                        )}
                        <div className="text-xs text-brand-dark/50 mt-0.5">{order.country}</div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
