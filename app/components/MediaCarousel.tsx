"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

const PHOTO_DURATION = 2000;

type MediaItem = {
  type: "photo" | "video";
  url: string;
  poster_url: string | null;
  instagram_handle?: string | null;
};

export default function MediaCarousel({
  items,
  alt,
}: {
  items: MediaItem[];
  alt: string;
}) {
  const n = items.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const barKeyRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const next = useCallback(() => {
    videoRef.current?.pause();
    barKeyRef.current += 1;
    setCurrent((c) => (c + 1) % Math.max(n, 1));
  }, [n]);

  const prev = useCallback(() => {
    videoRef.current?.pause();
    barKeyRef.current += 1;
    setCurrent((c) => (c - 1 + Math.max(n, 1)) % Math.max(n, 1));
  }, [n]);

  const currentItem = items[current];
  const isVideo = currentItem?.type === "video";

  // Auto-advance: only for photo slides; video slides advance on 'ended' event
  useEffect(() => {
    if (paused || n <= 1 || isVideo) return;
    const id = setTimeout(next, PHOTO_DURATION);
    return () => clearTimeout(id);
  }, [current, paused, n, next, isVideo]);

  // When slide changes to a video, play it
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current, isVideo]);

  // React's `muted` prop doesn't update the DOM property after mount
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  }

  if (n === 0) {
    return <div className="w-full aspect-[16/9] rounded-2xl bg-[#F0EDE8]" />;
  }

  return (
    <div
      className="relative aspect-[16/9] rounded-2xl overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {items.map((item, i) => (
        <div
          key={`${item.url}-${i}`}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? "opacity-100 z-[1]" : "opacity-0 z-0"
          }`}
        >
          {item.type === "video" ? (
            <div className="relative w-full h-full bg-black">
              {item.poster_url && (
                <img
                  src={item.poster_url}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl"
                />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <video
                ref={i === current ? videoRef : undefined}
                src={item.url}
                poster={item.poster_url ?? undefined}
                className="relative w-full h-full object-contain"
                playsInline
                muted={muted}
                preload="auto"
                loop={n === 1}
                onEnded={n > 1 ? next : undefined}
                onStalled={n > 1 ? () => setTimeout(next, 3000) : undefined}
                onError={n > 1 ? next : undefined}
              />
            </div>
          ) : (
            <Image
              src={item.url}
              alt={`${alt} — foto ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          )}
        </div>
      ))}

      {/* Story progress bars */}
      {n > 1 && (
        <div className="absolute top-3 inset-x-3 z-10 flex gap-1.5">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] bg-white/35 rounded-full overflow-hidden"
            >
              {i < current ? (
                <div className="h-full w-full bg-white rounded-full" />
              ) : i === current ? (
                item.type === "video" ? (
                  // Video slides: solid bar (progress tracked by the video element itself)
                  <div className="h-full w-full bg-white/60 rounded-full" />
                ) : (
                  <div
                    key={barKeyRef.current}
                    className="h-full bg-white rounded-full"
                    style={{
                      animation: paused
                        ? "none"
                        : `story-fill ${PHOTO_DURATION}ms linear forwards`,
                    }}
                  />
                )
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Prev / Next tap zones */}
      {n > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-0 top-0 h-full w-1/3 z-10 flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity"
          >
            <span className="w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center text-xl font-bold">
              ‹
            </span>
          </button>
          <button
            onClick={next}
            aria-label="Próximo"
            className="absolute right-0 top-0 h-full w-1/3 z-10 flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity"
          >
            <span className="w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center text-xl font-bold">
              ›
            </span>
          </button>
        </>
      )}

      {/* Instagram attribution */}
      {currentItem?.instagram_handle && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
          <div style={{
            width: 22, height: 22, borderRadius: 7, flexShrink: 0,
            background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
            {currentItem.instagram_handle}
          </span>
        </div>
      )}

      {/* Mute/unmute toggle — bottom-right above counter, only on video slides */}
      {isVideo && (
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Ativar som" : "Silenciar"}
          className="absolute bottom-[38px] right-2 z-10 bg-black/50 text-white rounded-full p-2 cursor-pointer"
        >
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97V10l2.45 2.45c.03-.15.05-.3.05-.45zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          )}
        </button>
      )}

      {/* Counter pill — shows video icon for video slides */}
      {n > 1 && (
        <div className="absolute bottom-3 right-3 z-10 bg-black/40 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          {isVideo && <span>▶</span>}
          {current + 1} / {n}
        </div>
      )}
    </div>
  );
}
