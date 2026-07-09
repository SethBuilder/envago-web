import { MetadataRoute } from "next";
import { fetchActivities, fetchArticles, fetchStories } from "./lib/api";

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

    // Articles + Web Stories
    const [articlesRes, storiesRes] = await Promise.all([fetchArticles(), fetchStories()]);
    const articleUrls: MetadataRoute.Sitemap = articlesRes.data.map((a) => ({
      url: `${base}/guias/${a.slug}`,
      lastModified: a.published_at ? new Date(a.published_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const storyUrls: MetadataRoute.Sitemap = storiesRes.data.map((s) => ({
      url: `${base}/story/${s.article_slug}`,
      lastModified: s.published_at ? new Date(s.published_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...static_pages, ...activityUrls, ...providerUrls, ...articleUrls, ...storyUrls];
  } catch {
    return static_pages;
  }
}
