"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copia" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0"
    >
      {copied ? "Copiato!" : label}
    </button>
  );
}
