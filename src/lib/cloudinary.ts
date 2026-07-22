/// <reference types="vite/client" />
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "df5rgwdng";
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "editors_hub_store_payment";

export const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME 
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : "";
