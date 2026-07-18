import emailjs from '@emailjs/browser';

interface EmailParams {
  to_email: string;
  to_name: string;
  order_id: string;
  product_name: string;
  download_link: string;
  subject?: string;
  body?: string;
}

export const sendApprovalEmail = async (params: EmailParams): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use the hardcoded keys by default, as environment variables might contain old deleted template IDs
    const serviceId = 'default_service';
    const templateId = 'template_gmucd5s';
    const publicKey = 'LyR7uPNP80yEgPXCC';

    // Matches the new template structure exactly
    const templateParams = {
      email: params.to_email,
      name: "Editors Hub Store",
      subject: params.subject,
      message: params.body
    };

    console.log("Sending email with params:", templateParams);

    // Try initializing it globally like in the HTML script
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      {
        publicKey: publicKey,
      }
    );

    console.log("EmailJS response:", response);
    
    return { success: response.status === 200 };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    if (error.text) {
      console.error("EmailJS Error details:", error.text);
    }
    return { success: false, error: error?.text || error?.message || "Unknown error" };
  }
};
