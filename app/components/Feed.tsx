"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchActivities, type ApiActivity, type ApiCategory } from "../lib/api";
import { categories } from "../data";
import ActivityCard from "./ActivityCard";

interface Meta { current_page: number; last_page: number; total: number }

export default function Feed({
  initialActivities,
  initialMeta,
  apiCategories,
  initialCategory = "todos",
}: {
  initialActivities: ApiActivity[];
  initialMeta: Meta;
  apiCategories: ApiCategory[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialCategory);
  const [activities, setActivities] = useState(initialActivities);
  const [meta, setMeta] = useState(initialMeta);
  const [isPending, startTransition] = useTransition();

  // Only show categories that have active trips (from API) plus "Todos"
  const activeSlugs = new Set(apiCategories.map((c) => c.slug));
  const visibleCategories = categories.filter(
    (c) => c.slug === "todos" || activeSlugs.has(c.slug)
  );

  function changeCategory(slug: string) {
    setActive(slug);
    router.replace(slug === "todos" ? "/" : `/?categoria=${slug}`, { scroll: false });
    startTransition(async () => {
      const { data, meta } = await fetchActivities({ category: slug });
      setActivities(data);
      setMeta(meta);
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
      </div>
    </>
  );
}
