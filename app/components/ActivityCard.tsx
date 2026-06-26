import Image from "next/image";
import Link from "next/link";
import type { ApiActivity } from "../lib/api";
import CommentTicker from "./CommentTicker";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutos`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hLabel = h === 1 ? "1 hora" : `${h} horas`;
  if (m === 0) return hLabel;
  if (m === 30) return `${hLabel} e meia`;
  return `${hLabel} e ${m} minutos`;
}

export default function ActivityCard({ activity }: { activity: ApiActivity }) {
  return (
    <Link href={`/passeio/${activity.slug}`} className="block cursor-pointer group">
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow border border-[#E5E1DC] flex flex-col">
        {/* Photo */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EDE8]">
          {activity.cover_url ? (
            <Image
              src={activity.cover_url}
              alt={activity.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="40" height="40" fill="none" stroke="#C5BDB5" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          )}

          {/* Gradient + ticker overlay */}
          {activity.recent_reviews.length > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 z-10"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}
            >
              <div className="px-3 pb-3 pt-8">
                <CommentTicker reviews={activity.recent_reviews} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Rating + location */}
          <div className="flex items-center gap-1.5 text-sm text-[#666]">
            {activity.avg_rating ? (
              <>
                <span className="text-amber-400">★</span>
                <span className="font-semibold text-[#111]">{activity.avg_rating}</span>
                <span className="font-medium">({activity.review_count})</span>
              </>
            ) : (
              <span className="font-medium text-[#aaa]">Novo</span>
            )}
            <span className="ml-auto font-semibold">📍 {activity.city}</span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-[15px] leading-snug text-[#111] line-clamp-2">
            {activity.name}
          </h3>

          {/* Duration */}
          <p className="text-sm font-semibold text-[#555]">⏱ {formatDuration(activity.duration_minutes)}</p>

          {/* Price */}
          <div className="flex justify-end pt-1">
            <div className="text-right">
              <span className="text-xs font-semibold text-[#888] block leading-none">a partir de</span>
              <span className="text-lg font-bold text-[#111] leading-tight">
                R$ {Number(activity.price).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
