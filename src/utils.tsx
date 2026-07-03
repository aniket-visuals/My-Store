import React from "react";

/**
 * Formats a given string, converting markdown-style double asterisks **bold** to <strong> tags.
 */
export function formatDescription(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-brand-dark brightness-[1.1]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const getProfileAvatarUrl = (key: string | null): string | null => {
  if (!key) return null;
  switch (key) {
    case "cat":
      return "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=240";
    case "designer":
      return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=240";
    case "pixel":
      return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=240";
    case "ronald":
      return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240";
    default:
      return null;
  }
};
