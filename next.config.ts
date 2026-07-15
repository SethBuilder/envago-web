import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "https://api.envago.live";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "qr.stripe.com" },
      { protocol: "https", hostname: "api.envago.live" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "envago-media.s3.sa-east-1.amazonaws.com" },
    ],
  },
  async redirects() {
    return [

      { source: "/parceiros", destination: "https://painel.envago.live/parceiros", permanent: false },
      { source: "/login", destination: "https://painel.envago.live/login", permanent: false },
      { source: "/provider", destination: "https://painel.envago.live/provider", permanent: false },
      { source: "/provider/:path*", destination: "https://painel.envago.live/provider/:path*", permanent: false },
      { source: "/admin", destination: "https://painel.envago.live/admin", permanent: false },
      { source: "/admin/:path*", destination: "https://painel.envago.live/admin/:path*", permanent: false },
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
      {
        source: "/api/lara/:path*",
        destination: `${API_ORIGIN}/api/lara/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${API_ORIGIN}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
