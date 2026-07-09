import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Navbar from "../../components/Navbar";
import { fetchArticle } from "../../lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await fetchArticle(slug);
    return {
      title: data.meta_title ?? `${data.title} | Envago`,
      description: data.meta_description ?? undefined,
      openGraph: {
        title: data.meta_title ?? data.title,
        description: data.meta_description ?? undefined,
        type: "article",
        locale: "pt_BR",
        siteName: "Envago",
        images: data.cover_image ? [{ url: data.cover_image }] : [],
      },
      alternates: { canonical: `https://envago.live/guias/${slug}` },
    };
  } catch {
    return { title: "Guia | Envago" };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article;
  try {
    const { data } = await fetchArticle(slug);
    article = data;
  } catch {
    notFound();
  }

  const storyPublished = article.story?.status === 'published' && (article.story.slides?.length ?? 0) > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.meta_description ?? undefined,
    "image": article.cover_image ?? undefined,
    "datePublished": article.published_at,
    "publisher": {
      "@type": "Organization",
      "name": "Envago",
      "logo": { "@type": "ImageObject", "url": "https://envago.live/favicon-96x96.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://envago.live/guias/${article.slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        {article.destination && (
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ff2924] mb-3">
            {article.destination}
          </p>
        )}
        <h1 className="text-3xl font-bold text-[#111] leading-tight mb-4">
          {article.title}
        </h1>
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full rounded-2xl object-cover max-h-80 mb-8"
          />
        ) : (
          <div className="w-full rounded-2xl mb-8 bg-[#E5E1DC]" style={{ height: 320 }} />
        )}
        <article
          className="max-w-none [&_p]:mb-6 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#111] [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#111]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        {storyPublished && (
          <div className="flex flex-col items-center gap-2 mt-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">Resumo visual</p>
            <a
              href={`/story/${encodeURIComponent(article.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", width: 180, height: 320, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.15)", background: "#E5E1DC", flexShrink: 0 }}
            >
              {article.story?.slides?.[0]?.image_url ? (
                <img src={article.story.slides[0].image_url} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a1a2e,#0f3460)" }} />
              )}
            </a>
          </div>
        )}
      </main>
      <footer className="border-t border-[#E5E1DC] bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-sm text-[#999] text-center">
          © 2026 Elmughrabi LIMITED · Envago
        </div>
      </footer>
    </>
  );
}
