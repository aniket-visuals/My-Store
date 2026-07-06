import { collection, doc, serverTimestamp, runTransaction } from "firebase/firestore";
import { db } from "../firebase";
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from "../lib/cloudinary";

export const uploadScreenshot = async (file: File): Promise<string> => {
  console.log("Uploading to Cloudinary...");
  console.log("URL:", CLOUDINARY_UPLOAD_URL);
  console.log("Preset:", CLOUDINARY_UPLOAD_PRESET);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    console.log("Cloudinary response:", responseData);

    if (!response.ok) {
      throw new Error(responseData.error?.message || "Cloudinary upload failed");
    }

    return responseData.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "Failed to upload to Cloudinary");
  }
};

export interface OrderData {
  customerName: string;
  email: string;
  country: string;
  discordOrTelegramUsername: string;
  paymentMethod: string;
  currency: string;
  amount: number;
  paymentScreenshotUrl: string;
  productId: string;
  productName: string;
}

export const createOrder = async (orderData: OrderData): Promise<string> => {
  const counterRef = doc(db, "counters", "orders");
  let newOrderId = "EH-000001";

  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let currentCount = 0;
    if (counterDoc.exists()) {
      currentCount = counterDoc.data().count || 0;
    }
    
    currentCount++;
    transaction.set(counterRef, { count: currentCount }, { merge: true });
    
    newOrderId = `EH-${currentCount.toString().padStart(6, '0')}`;
    
    const newOrderRef = doc(collection(db, "orders"));
    transaction.set(newOrderRef, {
      ...orderData,
      orderId: newOrderId,
      status: "Pending",
      createdAt: serverTimestamp()
    });
  });

  return newOrderId;
};
