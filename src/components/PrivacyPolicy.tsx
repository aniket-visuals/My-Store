import React, { useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateMetaTags } from "../utils/seo";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    updateMetaTags({
      title: "Privacy Policy — Editors Hub Store",
      description: "Privacy Policy for Editors Hub Store. Learn how we handle your data.",
      url: "https://www.editorshubstore.in/privacy"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg font-sans pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-brand-dark/60 hover:text-brand-primary transition-colors mb-8 text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-brand-dark/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-display font-bold text-3xl text-brand-dark">Privacy Policy</h1>
          </div>
          
          <p className="text-brand-dark/60 text-sm mb-8">
            Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8 text-sm text-brand-dark/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">1. Information We Collect</h2>
              <p>
                At Editors Hub Store, we collect minimal personal information to provide you with the best possible service. 
                When you create an account or make a purchase, we may collect your name, email address, country, and optional social media usernames (like Discord) for order fulfillment and support.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">2. How We Use Personal Information</h2>
              <p>
                We use your personal information strictly for processing orders, delivering digital products, providing customer support, and improving our marketplace. We do not sell, rent, or share your personal data with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">3. Google Authentication</h2>
              <p>
                If you choose to sign in using your Google account, we only collect your <strong>name, email address, and profile picture</strong> as provided by Google's standard authentication profile. 
              </p>
              <p className="mt-2 font-semibold text-brand-dark">
                We absolutely never request, access, or store your Gmail, Google Drive, Google Calendar, Google Contacts, or any other private Google data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">4. Firebase Authentication</h2>
              <p>
                We use Google Firebase Authentication to securely manage user sign-ins and sessions. Firebase handles your credentials securely and complies with major security standards to ensure your account is protected against unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">5. Cookies</h2>
              <p>
                Our website uses minimal cookies essential for functionality, such as keeping you logged in and remembering your cart contents. We do not use intrusive tracking cookies across other websites.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">6. Payment Information</h2>
              <p>
                We process payments through secure manual reviews via screenshots. We do not directly collect, process, or store credit card numbers or bank account details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">7. User-Generated Reviews</h2>
              <p>
                If you submit a review for a product, your name (or chosen username) and the content of your review will be displayed publicly on our website. You can request removal of your reviews by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">8. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information. All data is transmitted securely via HTTPS and stored in protected cloud databases (Firestore) with strict access rules.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">9. User Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data. If you wish to delete your account or request a copy of your data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">10. Contact Information</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact our support team.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
