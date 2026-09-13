sed -i 's/, Menu //g' src/components/AccountPortal.tsx
sed -i 's/Menu, //g' src/components/AccountPortal.tsx
sed -i '1s/^/import { updateMetaTags } from "..\/utils";\nimport { useNavigate } from "react-router-dom";\nimport { User as FirebaseUser } from "firebase\/auth";\nimport AuthenticatedDashboard from ".\/AuthenticatedDashboard";\nimport { motion, AnimatePresence } from "motion\/react";\n/' src/components/AccountPortal.tsx
sed -i 's/X, //g' src/components/CheckoutPage.tsx
