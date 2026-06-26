import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Envago | Passeios e Aventuras no Brasil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", position: "relative" }}>
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1696219914843-33c77f66c9e3?w=1200&q=80&fit=crop&crop=center"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Dark panel behind logo + tagline */}
        <div style={{
          position: "absolute",
          left: 100, top: 170, width: 1000, height: 300,
          background: "rgba(0,0,0,0.65)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}>
          <img
            src="https://envago.live/logo.svg"
            style={{ width: 640, height: "auto" }}
          />
          <div style={{ color: "#ffffff", fontSize: 30, fontFamily: "sans-serif", letterSpacing: 0 }}>
            Passeios e Aventuras no Brasil
          </div>
        </div>

        {/* Red strip */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: 36,
          background: "#FF2924",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "#ffffff", fontSize: 19, fontFamily: "sans-serif", letterSpacing: 3 }}>
            envago.live
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
