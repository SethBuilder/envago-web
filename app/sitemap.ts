import { MetadataRoute } from "next";
import { fetchActivities } from "./lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://envago.live";

  const static_pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  ];

  try {
    // Fetch all pages to get every activity and provider slug
    const first = await fetchActivities({ page: 1 });
    const pages = [first];

    for (let p = 2; p <= first.meta.last_page; p++) {
      pages.push(await fetchActivities({ page: p }));
    }

    const activities = pages.flatMap((r) => r.data);

    const activityUrls: MetadataRoute.Sitemap = activities.map((a) => ({
      url: `${base}/passeio/${a.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const providerSlugs = [...new Set(activities.map((a) => a.provider?.slug).filter(Boolean))];
    const providerUrls: MetadataRoute.Sitemap = providerSlugs.map((slug) => ({
      url: `${base}/operadores/${slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...static_pages, ...activityUrls, ...providerUrls];
  } catch {
    return static_pages;
  }
}
