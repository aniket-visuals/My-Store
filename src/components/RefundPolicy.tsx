import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateMetaTags } from "../utils/seo";
import { ArrowLeft, RefreshCw, Shield, AlertTriangle } from "lucide-react";
import Footer from "./Footer";

export default function RefundPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    updateMetaTags({
      title: "Refund Policy — Editors Hub Store",
      description: "Read our refund policy. Since all products are digital downloads, we generally do not offer refunds once a product is purchased.",
      url: "https://www.editorshubstore.in/refund"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-brand-dark/60 hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 md:py-24 w-full">
        <div className="space-y-12">
          {/* Title Section */}
          <div className="space-y-4">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-brand-dark tracking-tight">
              Refund Policy
            </h1>
            <p className="text-lg text-brand-dark/60">
              Last updated: July 15, 2026
            </p>
          </div>

          {/* Policy Text */}
          <div className="prose prose-brand max-w-none">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 m-0">Digital Products Notice</h3>
                <p className="text-amber-800 m-0 mt-2">
                  Because our products are digital assets and templates that are immediately accessible and downloadable upon purchase, we operate a strict <strong>No Refund</strong> policy for most items.
                </p>
              </div>
            </div>

            <h2>1. General Policy</h2>
            <p>
              At Editors Hub Store, we provide high-quality digital assets for creators. Due to the nature of digital goods, it is not possible to "return" a product once it has been downloaded. Therefore, we generally do not offer refunds, exchanges, or cancellations once a purchase is completed.
            </p>

            <h2>2. Exceptional Circumstances</h2>
            <p>
              We may, at our sole discretion, offer a refund or exchange in the following rare circumstances:
            </p>
            <ul>
              <li><strong>Non-delivery of the product:</strong> If due to a technical issue you do not receive the delivery email and our system shows the file was never downloaded.</li>
              <li><strong>Major defects:</strong> If the product has a major defect that was not described, and our support team cannot provide a fix or workaround within a reasonable time.</li>
              <li><strong>Duplicate purchases:</strong> If you accidentally purchased the exact same product twice within 24 hours.</li>
            </ul>

            <h2>3. Requesting a Refund</h2>
            <p>
              If you believe your situation qualifies for an exception, please contact our support team within <strong>7 days</strong> of your purchase. You must include:
            </p>
            <ul>
              <li>Your order number</li>
              <li>The email address used for the purchase</li>
              <li>A detailed explanation of the issue, including screenshots or recordings if applicable</li>
            </ul>

            <h2>4. Disallowed Reasons</h2>
            <p>
              We do <strong>not</strong> grant refunds for the following reasons:
            </p>
            <ul>
              <li>You changed your mind after purchasing.</li>
              <li>You lack the required software or hardware mentioned in the product description (e.g., purchasing an After Effects template but you only have Premiere Pro).</li>
              <li>You lack the expertise to use the product.</li>
              <li>You purchased the product by mistake and have already downloaded the files.</li>
            </ul>

            <h2>5. Contact Us</h2>
            <p>
              For any questions or support requests, please reach out to us at <a href="mailto:support@editorshubstore.in" className="text-brand-primary hover:underline">support@editorshubstore.in</a> or visit our <button onClick={() => navigate('/contact')} className="text-brand-primary hover:underline bg-transparent border-0 p-0 inline">Contact Page</button>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer scrollToSection={() => {}} setActiveCategory={() => {}} />
    </div>
  );
}
