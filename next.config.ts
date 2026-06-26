import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "qr.stripe.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/login", destination: "https://api.envago.live/login", permanent: false },
      { source: "/provider/:path*", destination: "https://api.envago.live/provider/:path*", permanent: false },
      { source: "/admin/:path*", destination: "https://api.envago.live/admin/:path*", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
      {
        source: "/api/webhooks/:path*",
        destination: `${API_ORIGIN}/api/webhooks/:path*`,
      },
    ];
  },
};

export default nextConfig;
