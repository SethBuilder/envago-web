"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { fetchActivities, fetchArticles, fetchStories, type ApiActivity, type ApiArticle, type ApiCategory, type ApiStoryListItem } from "../lib/api";
import { categories } from "../data";
import ActivityCard from "./ActivityCard";

interface Meta { current_page: number; last_page: number; total: number }

export default function Feed({
  initialActivities,
  initialMeta,
  apiCategories,
  initialCategory = "todos",
  initialArticles = [],
  initialStories = [],
}: {
  initialActivities: ApiActivity[];
  initialMeta: Meta;
  apiCategories: ApiCategory[];
  initialCategory?: string;
  initialArticles?: ApiArticle[];
  initialStories?: ApiStoryListItem[];
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialCategory);
  const [activities, setActivities] = useState(initialActivities);
  const [meta, setMeta] = useState(initialMeta);
  const [articles, setArticles] = useState<ApiArticle[]>(initialArticles);
  const [stories, setStories] = useState<ApiStoryListItem[]>(initialStories);
  const [isPending, startTransition] = useTransition();

  // Always show Guias chip; only show tour categories that have active trips
  const activeSlugs = new Set(apiCategories.map((c) => c.slug));
  const visibleCategories = categories.filter(
    (c) => c.slug === "todos" || c.slug === "guias" || activeSlugs.has(c.slug)
  );

  function changeCategory(slug: string) {
    setActive(slug);
    router.replace(slug === "todos" ? "/" : `/?categoria=${slug}`, { scroll: false });
    startTransition(async () => {
      if (slug === "guias") {
        const [{ data: articleData }, { data: storyData }] = await Promise.all([fetchArticles(), fetchStories()]);
        setArticles(articleData);
        setStories(storyData);
      } else {
        const { data, meta } = await fetchActivities({ category: slug });
        setActivities(data);
        setMeta(meta);
      }
    });
  }

  function loadMore() {
    startTransition(async () => {
      const { data, meta: newMeta } = await fetchActivities({
        category: active,
        page: meta.current_page + 1,
      });
      setActivities((prev) => [...prev, ...data]);
      setMeta(newMeta);
    });
  }

  return (
    <>
      {/* Category bar */}
      <div className="bg-white border-b border-[#E5E1DC] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            {visibleCategories.map((cat) => {
              const isActive = cat.slug === active;
              return (
                <button
                  key={cat.slug}
                  onClick={() => changeCategory(cat.slug)}
                  className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl flex-shrink-0 transition-all group
                    ${isActive ? "bg-[#ff2924] text-white" : "hover:bg-[#ECEAE6] text-[#555]"}`}
                >
                  {cat.icon ? (
                    <Image
                      src={cat.icon}
                      alt={cat.label}
                      width={72}
                      height={72}
                      className="w-18 h-18 object-contain transition-all"
                    />
                  ) : (
                    <span className="w-18 h-18 flex items-center justify-center">
                      <svg viewBox="0 0 72 72" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="24" height="24" rx="4" fill="currentColor"/>
                        <rect x="40" y="8" width="24" height="24" rx="4" fill="currentColor"/>
                        <rect x="8" y="40" width="24" height="24" rx="4" fill="currentColor"/>
                        <rect x="40" y="40" width="24" height="24" rx="4" fill="currentColor"/>
                      </svg>
                    </span>
                  )}
                  <span className="text-xs font-bold whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {active === "guias" ? (
          <>
            <div className="flex items-center gap-3 my-6">
              <span className="text-xl">🧭</span>
              <h2 className="text-xl font-bold text-[#111]">Guias de Viagem</h2>
              <span className="text-sm text-[#999]">— dicas e roteiros para sua aventura</span>
            </div>

            {stories.length > 0 && (
              <div className="overflow-x-auto -mx-4 px-4 pb-4 mb-6 scrollbar-hide">
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {stories.map((story) => (
                    <a
                      key={story.article_slug}
                      href={`/story/${encodeURIComponent(story.article_slug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 no-underline"
                      style={{ width: 72 }}
                    >
                      <div style={{ padding: 2.5, borderRadius: "50%", background: "#ff2924", flexShrink: 0 }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: "2px solid #fff", background: "#E5E1DC" }}>
                          {story.poster_image ? (
                            <img
                              src={story.poster_image}
                              alt={story.article_title}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a1a2e,#0f3460)" }} />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[#444] max-w-[72px] text-center truncate" style={{ fontSize: 11 }}>
                        {story.article_title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {isPending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E5E1DC] overflow-hidden animate-pulse">
                    <div className="aspect-[16/9] bg-[#E5E1DC]" />
                    <div className="p-4 flex flex-col gap-3">
                      <div className="h-3 bg-[#E5E1DC] rounded w-1/3" />
                      <div className="h-5 bg-[#E5E1DC] rounded w-full" />
                      <div className="h-3 bg-[#E5E1DC] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
                {articles.map((article) => (
                  <Link key={article.id} href={`/guias/${article.slug}`} className="group block bg-white rounded-2xl border border-[#E5E1DC] overflow-hidden hover:shadow-md transition-shadow">
                    {article.cover_image ? (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-[#ECEAE6] flex items-center justify-center">
                        <span className="text-4xl opacity-30">🧭</span>
                      </div>
                    )}
                    <div className="p-4">
                      {article.destination && (
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#ff2924]">
                          {article.destination}
                        </span>
                      )}
                      <h3 className="mt-1 font-bold text-[#111] leading-snug group-hover:text-[#ff2924] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.meta_description && (
                        <p className="mt-1.5 text-sm text-[#666] line-clamp-2">{article.meta_description}</p>
                      )}
                      <p className="mt-3 text-xs text-[#999]">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#999] py-16 text-center">
                Nenhum guia publicado ainda. Em breve!
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 my-6">
              <span className="live-dot w-2.5 h-2.5 bg-[#ff2924] rounded-full inline-block" />
              <h2 className="text-xl font-bold text-[#111]">Feed ao Vivo</h2>
              <span className="text-sm text-[#999]">— passeios disponíveis agora</span>
            </div>

            {isPending && activities.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E5E1DC] overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-[#E5E1DC]" />
                    <div className="p-4 flex flex-col gap-3">
                      <div className="h-3 bg-[#E5E1DC] rounded w-2/3" />
                      <div className="h-4 bg-[#E5E1DC] rounded w-full" />
                      <div className="h-3 bg-[#E5E1DC] rounded w-1/3" />
                      <div className="h-10 bg-[#E5E1DC] rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
                  {activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>

                {meta.current_page < meta.last_page && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={isPending}
                      className="px-10 py-4 rounded-full bg-[#111] text-white text-sm font-bold hover:bg-[#333] transition-colors disabled:opacity-50 shadow-md"
                    >
                      {isPending ? "Carregando..." : "Ver mais passeios"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[#999] py-16 text-center">
                Nenhum passeio disponível nesta categoria ainda.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
