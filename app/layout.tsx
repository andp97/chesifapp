import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "ChesifApp?",
  description: "Organizza, conferma, dividi. L'app per gli eventi tra amici senza stress.",
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  twitter: {
    card: "summary_large_image",
    title: "ChesifApp?",
    description: "Organizza, conferma, dividi. L'app per gli eventi tra amici senza stress.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased font-sans">
        {children}
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
