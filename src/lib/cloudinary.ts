/// <reference types="vite/client" />

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUDINARY_CLOUD_NAME) {
  throw new Error("Missing required environment variable: VITE_CLOUDINARY_CLOUD_NAME");
}

if (!CLOUDINARY_UPLOAD_PRESET) {
  throw new Error("Missing required environment variable: VITE_CLOUDINARY_UPLOAD_PRESET");
}

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
