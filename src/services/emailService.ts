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
    console.log("Sending email via backend API:", params);
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_email: params.to_email,
        subject: params.subject,
        body: params.body
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to send email via backend");
    }

    console.log("Email API response:", data);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { success: false, error: error?.message || "Unknown error" };
  }
};
