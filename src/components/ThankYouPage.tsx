import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Clock, Mail } from "lucide-react";

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, email } = location.state || {};

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-brand-dark/5 border border-brand-dark/10 p-8 text-center space-y-6">
        
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-bold text-2xl text-brand-dark">Order Received!</h1>
          <p className="font-mono text-sm text-brand-dark/60 bg-brand-dark/[0.02] py-2 px-4 rounded-lg inline-block border border-brand-dark/5">
            Order ID: <span className="font-bold text-brand-dark">{orderId}</span>
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-brand-dark/10 text-left">
          <div className="flex items-start gap-3 bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
            <Clock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-brand-dark/80">
              Payments are manually verified within <strong className="text-brand-dark">1 hour</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-brand-dark/[0.02] p-4 rounded-xl border border-brand-dark/5">
            <Mail className="w-5 h-5 text-brand-dark/60 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-brand-dark/80">
              After verification, your order details and download link will be sent to <strong className="text-brand-dark">{email}</strong>.
            </p>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-brand-dark hover:bg-black text-white py-4 rounded-xl text-sm font-mono font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </button>
        </div>
        
        <p className="text-xs font-medium text-brand-dark/40 pt-4">
          If you don't receive an email within 1 hour, please contact support.
        </p>

      </div>
    </div>
  );
}
