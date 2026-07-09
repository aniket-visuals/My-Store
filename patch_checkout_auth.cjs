const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

code = code.replace(
  `import { uploadScreenshot, createOrder } from "../services/orderService";`,
  `import { uploadScreenshot, createOrder } from "../services/orderService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";`
);

code = code.replace(
  `export default function CheckoutPage({ cart, clearCart }: { cart: Product[]; clearCart: () => void }) {
  const navigate = useNavigate();`,
  `export default function CheckoutPage({ cart, clearCart }: { cart: Product[]; clearCart: () => void }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);`
);

// We need to disable the submit button or show a warning if not authenticated
code = code.replace(
  `                disabled={!isFormValid || isSubmitting}`,
  `                disabled={!isFormValid || isSubmitting || !isAuthenticated}`
);

code = code.replace(
  `                {isSubmitting ? "Processing..." : "Place Order & Get Access"}`,
  `                {!isAuthenticated ? "Please Login to Place Order" : isSubmitting ? "Processing..." : "Place Order & Get Access"}`
);

fs.writeFileSync('src/components/CheckoutPage.tsx', code);
