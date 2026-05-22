"use client";

import { useState } from "react";

type Participant = {
  name: string;
  status: string;
  paymentStatus: string;
  quotes: number;
};

type Props = {
  eventName: string;
  totalCost: number;
  formattedDate: string | null;
  paymentInfo: string | null;
  participants: Participant[];
  shareUrl: string;
};

export function ShareRecapButton({ eventName, totalCost, formattedDate, paymentInfo, participants, shareUrl }: Props) {
  const [copied, setCopied] = useState(false);

  function buildRecap(): string {
    const confirmed = participants.filter((p) => p.status === "CONFIRMED");
    const totalQuotes = confirmed.reduce((sum, p) => sum + p.quotes, 0);
    const costPerQuote = totalQuotes > 0 ? totalCost / totalQuotes : null;
    const paid = confirmed.filter((p) => p.paymentStatus === "PAID");
    const unpaid = confirmed.filter((p) => p.paymentStatus !== "PAID");

    const lines: string[] = [];
    lines.push(`*${eventName}*`);
    if (formattedDate) lines.push(`📅 ${formattedDate}`);
    lines.push("");
    lines.push(`💰 Totale: €${totalCost.toFixed(2)}`);
    lines.push(`👥 Confermati: ${confirmed.length} su ${participants.length}`);
    if (costPerQuote !== null) lines.push(`📊 Quota: €${costPerQuote.toFixed(2)}`);

    if (paid.length > 0) {
      lines.push("");
      lines.push("✅ Pagati:");
      paid.forEach((p) => lines.push(`• ${p.name}${p.quotes > 1 ? ` (×${p.quotes})` : ""}`));
    }

    if (unpaid.length > 0) {
      lines.push("");
      lines.push("⏳ Da pagare:");
      unpaid.forEach((p) => {
        const amount = costPerQuote !== null ? ` — €${(costPerQuote * p.quotes).toFixed(2)}` : "";
        lines.push(`• ${p.name}${p.quotes > 1 ? ` (×${p.quotes})` : ""}${amount}`);
      });
    }

    if (paymentInfo) {
      lines.push("");
      lines.push(`💳 ${paymentInfo}`);
    }

    lines.push("");
    lines.push(`🔗 ${shareUrl}`);

    return lines.join("\n");
  }

  async function handleShare() {
    const text = buildRecap();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0">
        <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
      </svg>
      {copied ? "Copiato ✓" : "Condividi riepilogo"}
    </button>
  );
}
