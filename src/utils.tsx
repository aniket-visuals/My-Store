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
