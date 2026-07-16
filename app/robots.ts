import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout/", "/em-breve/", "/api/"] },
    sitemap: "https://envago.live/sitemap.xml",
  };
}
