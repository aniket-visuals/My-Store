import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Shield, Upload, Copy, Info, Clock, Download, Image as ImageIcon, X } from "lucide-react";
import { Product } from "../types";

type PaymentMethod = "upi" | "wise" | "paypal";

import { uploadScreenshot, createOrder } from "../services/orderService";

export default function CheckoutPage({ cart, clearCart }: { cart: Product[]; clearCart: () => void }) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [socialUsername, setSocialUsername] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const product = cart.length > 0 ? cart[0] : null;
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  // Computed values
  const inrConversionRate = 93;
  const priceINR = totalPrice * inrConversionRate;
  
  const paymentDetails = {
    upi: {
      id: "6299830102@ptaxis",
      name: "UPI (India)",
      amount: `₹${priceINR > 0 ? priceINR.toFixed(2) : "0.00"}`,
      instruction: "Open your UPI app (GPay, PhonePe, Paytm, etc.), scan the QR code or enter the UPI ID to make the payment.",
      qrCode: "https://res.cloudinary.com/df5rgwdng/image/upload/v1783354889/photo_2026-07-06_21-44-09_wojtrv.jpg"
    },
    wise: {
      id: "@ankitraj8",
      name: "Wise (International)",
      amount: `$${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}`,
      instruction: "Scan the Wise QR code or send payment directly to our Wise email address.",
      qrCode: "https://res.cloudinary.com/df5rgwdng/image/upload/v1783355648/Wise_edq4d5.png"
    },
    paypal: {
      id: "@Gunjan188",
      name: "PayPal (International)",
      amount: `$${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}`,
      instruction: "Scan the PayPal QR code or send payment directly to our PayPal email address.",
      qrCode: "https://res.cloudinary.com/df5rgwdng/image/upload/v1783353147/paypal_a8raqu.png"
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(paymentDetails[paymentMethod].id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validation
  
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


  const isFormValid = 
    fullName.trim() !== "" && 
    email.trim() !== "" && 
    country.trim() !== "" && 
    socialUsername.trim() !== "" && 
    screenshot !== null;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-xs font-mono font-bold text-brand-dark/40 hover:text-brand-primary uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Payment & Form */}
          <div className="flex-1 space-y-8">
            
            <div className="space-y-2">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-dark">Complete Order</h1>
              <p className="font-sans text-brand-dark/60">Fill in your details and complete the payment below.</p>
            </div>

            {/* Customer Details */}
            <section className="bg-white border border-brand-dark/10 rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs">1</span>
                Customer Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Full Name *</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Email Address *</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" 
                    className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Country *</label>
                  <input 
                    type="text" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States" 
                    className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Discord or Telegram Username *</label>
                  <input 
                    type="text" 
                    value={socialUsername}
                    onChange={(e) => setSocialUsername(e.target.value)}
                    placeholder="@username" 
                    className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary transition-colors" 
                  />
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="bg-white border border-brand-dark/10 rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs">2</span>
                Payment Method
              </h2>
              
              {/* Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["upi", "wise", "paypal"] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setCopied(false);
                    }}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-colors ${
                      paymentMethod === method 
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary" 
                        : "bg-brand-dark/[0.02] border-brand-dark/10 text-brand-dark/60 hover:bg-brand-dark/5"
                    }`}
                  >
                    {paymentDetails[method].name}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-brand-dark/[0.02] p-6 rounded-xl border border-brand-dark/5 mt-4">
                {/* QR Code */}
                <div className="shrink-0 w-64 h-64 bg-white rounded-xl border border-brand-dark/10 flex items-center justify-center shadow-sm relative overflow-hidden p-2">
                   <img src={paymentDetails[paymentMethod].qrCode} alt={`${paymentMethod} QR Code`} className="w-full h-full object-contain rounded-lg" />
                </div>

                <div className="flex-1 space-y-6 w-full text-center md:text-left">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-brand-dark/60">Amount to pay</p>
                    <p className="font-display font-bold text-3xl text-brand-dark">{paymentDetails[paymentMethod].amount}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-brand-dark/60">Scan the QR code or pay to {paymentMethod.toUpperCase()} ID:</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <code className="bg-white border border-brand-dark/10 px-4 py-2 rounded-lg font-mono text-sm font-bold text-brand-primary select-all">
                        {paymentDetails[paymentMethod].id}
                      </code>
                      <button 
                        onClick={handleCopyId}
                        className="p-2.5 rounded-lg border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark/60 transition-colors"
                        title={`Copy ${paymentMethod.toUpperCase()} ID`}
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-brand-dark/60 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-left">{paymentDetails[paymentMethod].instruction}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Upload Payment Screenshot */}
            <section className="bg-white border border-brand-dark/10 rounded-2xl p-6 md:p-8 space-y-6">
               <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs">3</span>
                Upload Screenshot *
              </h2>

              {!screenshotPreview ? (
                <div 
                  className="w-full border-2 border-dashed border-brand-dark/15 hover:border-brand-primary/40 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-brand-dark/[0.01] cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 bg-white shadow-sm border border-brand-dark/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-brand-dark/40 group-hover:text-brand-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-sans font-bold text-sm text-brand-dark">Click to upload payment screenshot</p>
                    <p className="text-xs text-brand-dark/50 font-medium">Supported formats: JPG, PNG, WEBP (Max 5 MB)</p>
                  </div>
                  <button className="mt-2 px-6 py-2 bg-white border border-brand-dark/10 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-dark/60 hover:text-brand-dark hover:border-brand-dark/30 transition-colors">
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 relative">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-brand-dark/10 shadow-sm">
                    <img src={screenshotPreview} alt="Payment Screenshot" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-sans font-bold text-sm text-emerald-600 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> Screenshot attached successfully
                    </p>
                    <p className="text-xs text-brand-dark/50 font-medium break-all px-4">{screenshot?.name}</p>
                  </div>
                  <button 
                    onClick={clearScreenshot}
                    className="mt-2 px-6 py-2 bg-white border border-brand-dark/10 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-dark/60 hover:text-brand-dark hover:border-brand-dark/30 transition-colors"
                  >
                    Change File
                  </button>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden" 
              />
            </section>

            {/* Submit Button */}
            <div className="pt-4 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 border border-red-200 text-sm font-medium p-4 rounded-xl flex items-start gap-2">
                  <Info className="w-5 h-5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}
              <button 
                onClick={handleOrderSubmit}
                disabled={!isFormValid || isSubmitting} 
                className={`w-full font-bold font-mono text-sm uppercase tracking-widest py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all ${
                  (isFormValid && !isSubmitting)
                    ? "bg-brand-primary hover:bg-brand-accent text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer" 
                    : "bg-brand-primary opacity-50 cursor-not-allowed text-white"
                }`}
              >
                <Shield className="w-5 h-5" />
                {isSubmitting ? "Processing..." : "Submit Order"}
              </button>
              
              {/* Verification Notice */}
              <div className="flex items-start justify-center gap-2 text-xs font-medium text-brand-dark/50 px-4 text-center">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Payments are manually verified within 1 hour. After verification, your order details and download link will be sent to your email. If you don't receive them, please contact us and we'll help you.</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white border border-brand-dark/10 rounded-2xl overflow-hidden sticky top-32">
              <div className="p-6 bg-brand-dark/[0.02] border-b border-brand-dark/10">
                <h3 className="font-display font-bold text-lg text-brand-dark">Order Summary</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {product ? (
                  <div className="space-y-6">
                    {/* Product Image & Title */}
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-brand-dark/10 bg-brand-dark/[0.02] shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-brand-dark/20" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display font-bold text-lg leading-tight">{product.name}</h4>
                        </div>
                        <div className="inline-block px-2 py-0.5 bg-brand-dark/[0.05] rounded text-[10px] font-mono font-bold text-brand-dark/60 uppercase tracking-widest">
                          V 1.0
                        </div>
                        <p className="font-bold text-brand-primary pt-1">${product.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Features List */}
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-brand-dark/5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/40">Included</p>
                        <ul className="space-y-2">
                          {product.features.slice(0, 4).map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs font-medium text-brand-dark/70">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm font-medium text-brand-dark/40">
                    Your cart is empty.
                  </div>
                )}

                {/* Badges / Notes */}
                <div className="space-y-3 pt-6 border-t border-brand-dark/10">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                     <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4 text-emerald-600" />
                     </div>
                     <div className="space-y-0.5">
                       <p className="text-xs font-bold text-brand-dark">Instant Download</p>
                       <p className="text-[10px] text-brand-dark/60 font-medium">Link delivered via email after verification</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-dark/[0.02] border border-brand-dark/5">
                     <div className="w-8 h-8 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-brand-dark/60" />
                     </div>
                     <div className="space-y-0.5">
                       <p className="text-xs font-bold text-brand-dark">Lifetime Updates</p>
                       <p className="text-[10px] text-brand-dark/60 font-medium">Free access to all future versions</p>                     </div>                  </div>                </div>

                {/* Totals */}
                <div className="pt-6 border-t border-brand-dark/10 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium text-brand-dark/60">
                    <span>Subtotal</span>
                    <span>${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex items-center justify-between font-display font-bold text-xl text-brand-dark">
                    <span>Total</span>
                    <span>${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}</span>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
