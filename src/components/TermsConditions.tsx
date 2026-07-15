import React, { useEffect } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateMetaTags } from "../utils/seo";

export default function TermsConditions() {
  const navigate = useNavigate();

  useEffect(() => {
    updateMetaTags({
      title: "Terms & Conditions — Editors Hub Store",
      description: "Terms & Conditions for Editors Hub Store. Please read these terms carefully before using our website.",
      url: "https://www.editorshubstore.in/terms"
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
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="font-display font-bold text-3xl text-brand-dark">Terms & Conditions</h1>
          </div>
          
          <p className="text-brand-dark/60 text-sm mb-8">
            Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8 text-sm text-brand-dark/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Editors Hub Store, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or purchase our products.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">2. Digital Product Purchases</h2>
              <p>
                All products available on Editors Hub Store are digital downloads (assets, plugins, sound effects, etc.). Upon successful payment and order approval, you will receive access to download the purchased files. Delivery times may vary slightly due to our manual review process for payments.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">3. Refund Policy</h2>
              <p>
                Due to the nature of digital products, all sales are final. We do not offer refunds, returns, or exchanges once the digital files have been downloaded or accessed. If you experience technical issues with a file, please contact support for assistance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">4. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during the registration and checkout process. We reserve the right to suspend or terminate accounts that violate our terms or engage in fraudulent activities.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">5. Copyright</h2>
              <p>
                All content, designs, products, and materials available on Editors Hub Store are the intellectual property of Editors Hub Store and its creators. You may not claim ownership of these assets or distribute them as your own.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">6. License</h2>
              <p>
                When you purchase a product, you are granted a non-exclusive, non-transferable license to use the assets in your personal or commercial video projects. You are <strong>strictly prohibited</strong> from reselling, sublicensing, or redistributing the original files in any form, modified or unmodified.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">7. User Responsibilities</h2>
              <p>
                You agree not to use our website or products for any unlawful purpose. You must not attempt to hack, disrupt, or exploit our platform, or use stolen payment information to make purchases.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">8. Limitation of Liability</h2>
              <p>
                Editors Hub Store and its creators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, use of, or inability to use the website or our digital products.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">9. Changes to Terms</h2>
              <p>
                We reserve the right to update or modify these Terms & Conditions at any time without prior notice. Your continued use of the website after any changes indicates your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-3">10. Contact Information</h2>
              <p>
                If you have any questions or concerns regarding these Terms & Conditions, please contact us at <strong>aniketrajcargal123@gmail.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
