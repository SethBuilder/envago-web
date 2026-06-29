"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ApiActivity } from "../lib/api";
import { categories as categoryData } from "../data";

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export default function ProviderActivities({
  activities,
  stripeReady,
}: {
  activities: ApiActivity[];
  stripeReady: boolean;
}) {
  const categories = Array.from(
    new Map(
      activities
        .filter((a) => a.category)
        .map((a) => [a.category!.slug, a.category!])
    ).values()
  );

  const multiCategory = categories.length > 1;
  const singleCategory = categories.length === 1 ? categories[0] : null;

  const [active, setActive] = useState<string | null>(null);

  function iconFor(slug: string) {
    return categoryData.find((c) => c.slug === slug)?.icon ?? "";
  }

  const filtered = active
    ? activities.filter((a) => a.category?.slug === active)
    : activities;

  if (activities.length === 0) {
    return (
      <div className="text-center py-16 text-[#aaa]">
        <p className="text-lg">Nenhum passeio disponível no momento.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Multi-category filters */}
      {multiCategory && (
        <div className="bg-white border-b border-[#E5E1DC] mb-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => setActive(null)}
              className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl flex-shrink-0 transition-all group cursor-pointer ${
                active === null ? "bg-[#ff2924] text-white" : "hover:bg-[#ECEAE6] text-[#555]"
              }`}
            >
              <span className={`w-[72px] h-[72px] flex items-center justify-center transition-opacity ${active === null ? "opacity-100" : "opacity-90 group-hover:opacity-100"}`}>
                <svg viewBox="0 0 72 72" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="24" height="24" rx="4" fill="currentColor"/>
                  <rect x="40" y="8" width="24" height="24" rx="4" fill="currentColor"/>
                  <rect x="8" y="40" width="24" height="24" rx="4" fill="currentColor"/>
                  <rect x="40" y="40" width="24" height="24" rx="4" fill="currentColor"/>
                </svg>
              </span>
              <span className="text-xs font-bold whitespace-nowrap">Todos</span>
            </button>
            {categories.map((cat) => {
              const icon = iconFor(cat.slug);
              const isActive = active === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActive(isActive ? null : cat.slug)}
                  className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl flex-shrink-0 transition-all group cursor-pointer ${
                    isActive ? "bg-[#ff2924] text-white" : "hover:bg-[#ECEAE6] text-[#555]"
                  }`}
                >
                  {icon ? (
                    <Image
                      src={icon}
                      alt={cat.name}
                      width={72}
                      height={72}
                      className={`w-[72px] h-[72px] object-contain ${isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"}`}
                    />
                  ) : (
                    <span className="w-[72px] h-[72px] flex items-center justify-center text-4xl">🏷️</span>
                  )}
                  <span className="text-xs font-bold whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        {/* Single category label */}
        {singleCategory && (
          <div className="flex items-center gap-2 mb-6">
            {iconFor(singleCategory.slug) && (
              <Image
                src={iconFor(singleCategory.slug)}
                alt={singleCategory.name}
                width={18}
                height={18}
                className="w-4 h-4 object-contain opacity-50"
              />
            )}
            <p className="text-sm text-[#999]">
              <span className="font-semibold text-[#ff2924]">{singleCategory.name}</span>
              {" · "}{activities.length} passeio{activities.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((activity) => (
          <Link
            key={activity.id}
            href={`/passeio/${activity.slug}`}
            className="group bg-white rounded-2xl border border-[#E5E1DC] overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] overflow-hidden bg-[#F7F5F2]">
              {activity.cover_url ? (
                <img
                  src={activity.cover_url}
                  alt={activity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-[#F0EDE8]" />
              )}
            </div>
            <div className="p-4">
              {multiCategory && activity.category && (
                <span className="text-[10px] font-bold text-[#ff2924] uppercase tracking-wide">
                  {activity.category.name}
                </span>
              )}
              <h2 className="font-semibold text-[#111] mt-1 leading-snug">{activity.name}</h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#888]">
                <span>⏱ {formatDuration(activity.duration_minutes)}</span>
                {activity.avg_rating && (
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    {activity.avg_rating}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#999]">a partir de</span>
                  <p className="font-bold text-[#111]">R$ {Number(activity.price).toFixed(0)}</p>
                </div>
                {!stripeReady && (
                  <span className="text-[10px] bg-[#fff8e1] text-[#b45309] font-semibold px-2 py-1 rounded-full">
                    Em breve
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}
