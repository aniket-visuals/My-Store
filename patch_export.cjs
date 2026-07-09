const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

if (!code.includes('Download as CSV')) {
  code = code.replace(
    `import { 
  Search, Filter, CheckCircle, XCircle, Eye, 
  Clock, ArrowLeft, LogOut, Image as ImageIcon, ShieldAlert,
  SearchX
} from "lucide-react";`,
    `import { 
  Search, Filter, CheckCircle, XCircle, Eye, 
  Clock, ArrowLeft, LogOut, Image as ImageIcon, ShieldAlert,
  SearchX, Download
} from "lucide-react";`
  );

  code = code.replace(
    `  const filteredOrders = orders.filter(order => {`,
    `  const exportOrders = () => {
    if (filteredOrders.length === 0) {
      showToast("No orders to export", "error");
      return;
    }
    const headers = ["Order ID", "Customer Name", "Email", "Country", "Social Username", "Product", "Payment Method", "Amount", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order.orderId || "",
        \`"\${(order.customerName || "").replace(/"/g, '""')}"\`,
        order.email || "",
        order.country || "",
        \`"\${(order.discordOrTelegramUsername || "").replace(/"/g, '""')}"\`,
        \`"\${(order.productName || "").replace(/"/g, '""')}"\`,
        order.paymentMethod || "",
        order.amount || 0,
        order.status || "",
        order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : ""
      ].join(","))
    ].join("\\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`orders_export_\${new Date().toISOString().split('T')[0]}.csv\`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {`
  );

  code = code.replace(
    `            </select>
          </div>
        </div>`,
    `            </select>
          </div>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-accent transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>`
  );

  fs.writeFileSync('src/components/AdminDashboard.tsx', code);
}
