import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChesifApp? — Organizza, conferma, dividi.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1d3faa 0%, #3b2fc9 100%)",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background circle decorations */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
        }}
      />

      {/* Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Logo mark — simplified calendar + check */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            background: "linear-gradient(135deg, #5B8CFF 0%, #7B5CFF 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Calendar icon */}
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
            {/* Card body */}
            <rect x="8" y="14" width="52" height="48" rx="8" fill="white" opacity="0.95" />
            {/* Top bar */}
            <rect x="8" y="14" width="52" height="18" rx="8" fill="#2F54EB" />
            <rect x="8" y="24" width="52" height="8" fill="#2F54EB" />
            {/* Rings */}
            <rect x="20" y="8" width="8" height="16" rx="4" fill="white" />
            <rect x="40" y="8" width="8" height="16" rx="4" fill="white" />
            {/* Check badge */}
            <circle cx="50" cy="52" r="14" fill="#22C55E" />
            <path d="M43 52L48 57L57 46" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
            lineHeight: 1,
            display: "flex",
          }}
        >
          ChesifApp?
        </div>

        {/* Payoff */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.70)",
            fontWeight: 400,
            letterSpacing: "0.5px",
            display: "flex",
          }}
        >
          Organizza, conferma, dividi.
        </div>
      </div>
    </div>,
    { ...size }
  );
}
