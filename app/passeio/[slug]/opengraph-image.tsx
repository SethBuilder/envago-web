import { ImageResponse } from "next/og";
import { fetchActivity } from "../../lib/api";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let name = "Passeio";
  let city = "Brasil";
  let price = "";
  let photo: string | null = null;
  let category = "";

  try {
    const { data } = await fetchActivity(slug);
    name = data.name;
    city = `${data.city}, ${data.state}`;
    price = `R$ ${Number(data.price).toFixed(0)}`;
    category = data.category?.name ?? "";
    photo = data.cover_url ?? data.videos?.[0]?.poster_url ?? null;
  } catch {}

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", position: "relative" }}>
        {/* Background photo */}
        {photo ? (
          <img src={photo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "#1a1a1a", display: "flex" }} />
        )}

        {/* Gradient overlay — bottom heavy */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)",
          display: "flex",
        }} />

        {/* Category pill */}
        {category && (
          <div style={{
            position: "absolute", top: 48, left: 64,
            background: "#FF2924", color: "#fff",
            fontSize: 22, fontFamily: "sans-serif",
            padding: "8px 20px", borderRadius: 999,
            display: "flex",
          }}>
            {category}
          </div>
        )}

        {/* Bottom content */}
        <div style={{
          position: "absolute", bottom: 80, left: 64, right: 64,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ color: "#ffffff", fontSize: 54, fontFamily: "sans-serif", fontWeight: "bold", lineHeight: 1.1 }}>
            {name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 26, fontFamily: "sans-serif" }}>
              📍 {city}
            </span>
            {price && (
              <span style={{
                background: "rgba(255,255,255,0.15)", color: "#fff",
                fontSize: 26, fontFamily: "sans-serif",
                padding: "4px 16px", borderRadius: 8, display: "flex",
              }}>
                A partir de {price}
              </span>
            )}
          </div>
        </div>

        {/* Envago branding — bottom right */}
        <div style={{
          position: "absolute", bottom: 28, right: 64,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, fontFamily: "sans-serif", letterSpacing: 2 }}>
            envago.live
          </span>
        </div>

        {/* Red strip */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 8,
          background: "#FF2924", display: "flex",
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
