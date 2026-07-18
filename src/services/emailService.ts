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

export const sendApprovalEmail = async (params: EmailParams): Promise<boolean> => {
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
      email: params.to_email, // Mapped to the user's email address
      name: "Editors Hub Store", // Sender name
      subject: params.subject,
      body: params.body
    };

    console.log("Sending email with params:", templateParams);

    // Try initializing it globally like in the HTML script
    emailjs.init({
      publicKey: publicKey,
    });

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log("EmailJS response:", response);
    
    return response.status === 200;
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return false;
  }
};
