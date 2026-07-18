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
    // FORCE hardcode the working keys provided by the user in case their AI Studio Settings has old keys
    const serviceId = 'default_service';
    const templateId = 'template_gmucd5s';
    const publicKey = 'LyR7uPNP80yEgPXCC';

    // Strictly match the fields from the working HTML form
    const templateParams = {
      to_name: params.to_name,
      order_id: params.order_id,
      product_name: params.product_name,
      download_link: params.download_link,
      email: params.to_email,
      to_email: params.to_email,
      name: "Editors Hub Store", // Sender name
      subject: params.subject,
      body: params.body
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
