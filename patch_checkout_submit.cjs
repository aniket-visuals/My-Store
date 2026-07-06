const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf-8');

code = code.replace(
  `export default function CheckoutPage({ cart }: { cart: Product[] }) {`,
  `import { uploadScreenshot, createOrder } from "../services/orderService";\n\nexport default function CheckoutPage({ cart, clearCart }: { cart: Product[]; clearCart: () => void }) {`
);

code = code.replace(
  `const [copied, setCopied] = useState(false);`,
  `const [copied, setCopied] = useState(false);\n  const [isSubmitting, setIsSubmitting] = useState(false);\n  const [errorMsg, setErrorMsg] = useState<string | null>(null);`
);

const handleOrderSubmitCode = `
  const handleOrderSubmit = async () => {
    if (!isFormValid || !screenshot || !product) return;
    
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Upload screenshot to Cloudinary
      const screenshotUrl = await uploadScreenshot(screenshot);

      // 2. Create order in Firestore
      const currency = paymentMethod === "upi" ? "INR" : "USD";
      const amount = paymentMethod === "upi" ? priceINR : totalPrice;

      const orderData = {
        customerName: fullName,
        email,
        country,
        discordOrTelegramUsername: socialUsername,
        paymentMethod: paymentMethod.toUpperCase(),
        currency,
        amount,
        paymentScreenshotUrl: screenshotUrl,
        productId: product.id,
        productName: product.name,
      };

      const orderId = await createOrder(orderData);

      // 3. Clear cart & redirect to Thank You page
      clearCart();
      navigate("/thank-you", { state: { orderId, email } });

    } catch (err: any) {
      console.error("Failed to submit order:", err);
      setErrorMsg(err.message || "Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
`;

code = code.replace(
  `const isFormValid = `,
  handleOrderSubmitCode + `\n\n  const isFormValid = `
);

code = code.replace(
  `<button \n                disabled={!isFormValid} \n                className={\`w-full font-bold font-mono text-sm uppercase tracking-widest py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all \${`,
  `{errorMsg && (\n                <div className="bg-red-50 text-red-600 border border-red-200 text-sm font-medium p-4 rounded-xl flex items-start gap-2">\n                  <Info className="w-5 h-5 shrink-0" />\n                  <p>{errorMsg}</p>\n                </div>\n              )}\n              <button \n                onClick={handleOrderSubmit}\n                disabled={!isFormValid || isSubmitting} \n                className={\`w-full font-bold font-mono text-sm uppercase tracking-widest py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all \${\n                  (isFormValid && !isSubmitting)`
);

code = code.replace(
  `Submit Order\n              </button>`,
  `{isSubmitting ? "Processing..." : "Submit Order"}\n              </button>`
);

fs.writeFileSync('src/components/CheckoutPage.tsx', code);
