import React, { useEffect, useState } from "react";
import { ArrowLeft, Mail, MessageSquare, Instagram, ExternalLink, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateMetaTags } from "../utils/seo";

export default function ContactPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    updateMetaTags({
      title: "Contact Us — Editors Hub Store",
      description: "Get in touch with the Editors Hub Store team for support, business inquiries, or questions about our digital products.",
      url: "https://www.editorshubstore.in/contact"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Format the email body
    const { name, email, subject, message } = formState;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: 'support@editorshubstore.in',
          subject: subject,
          body: body,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormState({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSubmitting(false);
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-brand-dark/60 hover:text-brand-primary transition-colors mb-8 text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="text-center mb-16 space-y-4">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-brand-dark tracking-tight">
            Get in <span className="text-brand-primary">Touch</span>
          </h1>
          <p className="text-brand-dark/60 text-lg max-w-xl mx-auto">
            Have a question about our products or need support? We're here to help. Reach out through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information & Links */}
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-dark/5 space-y-6">
              <h2 className="font-display font-bold text-xl text-brand-dark">Direct Contact</h2>
              
              <div className="space-y-4">
                <a href="mailto:support@editorshubstore.in" className="flex items-start gap-4 p-4 rounded-2xl bg-brand-bg hover:bg-brand-primary/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm text-brand-primary group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-dark mb-1">Email Support</h3>
                    <p className="text-xs text-brand-dark/60 break-all">support@editorshubstore.in</p>
                  </div>
                </a>

                <a href="https://discord.gg/sxGeT4SCBD" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-2xl bg-[#5865F2]/5 hover:bg-[#5865F2]/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center shrink-0 shadow-sm text-white group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#5865F2] mb-1">Discord Community</h3>
                    <p className="text-xs text-brand-dark/60">Join our server for quick help</p>
                  </div>
                </a>

                <a href="https://www.instagram.com/aniket_visuals/" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-2xl bg-[#E1306C]/5 hover:bg-[#E1306C]/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] flex items-center justify-center shrink-0 shadow-sm text-white group-hover:scale-110 transition-transform">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#E1306C] mb-1">Instagram</h3>
                    <p className="text-xs text-brand-dark/60">DM us for quick questions</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-brand-dark rounded-3xl p-8 shadow-sm text-white">
              <h2 className="font-display font-bold text-xl mb-3">Business Inquiries</h2>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Interested in sponsorships, partnerships, or custom editing work? Let's collaborate.
              </p>
              <a href="mailto:support@editorshubstore.in" className="inline-flex items-center gap-2 text-sm font-bold bg-white text-brand-dark px-6 py-3 rounded-xl hover:bg-brand-primary hover:text-white transition-colors w-full justify-center">
                <span>Partner with us</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-brand-dark/5 h-full">
              <h2 className="font-display font-bold text-2xl text-brand-dark mb-6">Send a Message</h2>
              
              {isSubmitted ? (
                <div className="bg-green-50 text-green-800 rounded-2xl p-8 text-center border border-green-100 flex flex-col items-center justify-center h-[350px]">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Message Sent Successfully!</h3>
                  <p className="text-sm opacity-80">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-dark/10 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-brand-dark placeholder-brand-dark/20"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-dark/10 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-brand-dark placeholder-brand-dark/20"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-dark/10 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-brand-dark placeholder-brand-dark/20"
                      placeholder="How can we help?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-dark/10 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-brand-dark resize-none placeholder-brand-dark/20"
                      placeholder="Type your message here..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-brand-primary hover:bg-brand-accent text-white rounded-xl font-bold font-mono text-sm uppercase tracking-widest transition-all shadow-md shadow-brand-primary/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
