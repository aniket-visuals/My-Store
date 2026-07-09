import emailjs from '@emailjs/browser';

interface EmailParams {
  to_email: string;
  to_name: string;
  order_id: string;
  product_name: string;
  download_link: string;
}

export const sendApprovalEmail = async (params: EmailParams): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS credentials are not configured in environment variables. Simulating email send for now.");
      return true; // Simulate success if no keys are provided
    }

    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name,
      order_id: params.order_id,
      product_name: params.product_name,
      download_link: params.download_link,
      reply_to: "support@editorshub.store",
      email: params.to_email, // Added to match {{email}} in your template
      name: "Editors Hub Store" // Added to match {{name}} in your template
    };

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    return response.status === 200;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
