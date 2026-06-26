"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

const DURATION = 2000;

export default function PhotoCarousel({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const n = photos.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const barKeyRef = useRef(0);

  const next = useCallback(() => {
    barKeyRef.current += 1;
    setCurrent((c) => (c + 1) % n);
  }, [n]);

  const prev = useCallback(() => {
    barKeyRef.current += 1;
    setCurrent((c) => (c - 1 + n) % n);
  }, [n]);

  // Auto-advance
  useEffect(() => {
    if (paused || n <= 1) return;
    const id = setTimeout(next, DURATION);
    return () => clearTimeout(id);
  }, [current, paused, n, next]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  }

  if (n === 0) return null;

  return (
    <div
      className="relative aspect-[16/9] rounded-2xl overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {photos.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? "opacity-100 z-[1]" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={src}
            alt={`${alt} — foto ${i + 1}`}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        </div>
      ))}

      {/* Story progress bars */}
      {n > 1 && (
        <div className="absolute top-3 inset-x-3 z-10 flex gap-1.5">
          {photos.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] bg-white/35 rounded-full overflow-hidden"
            >
              {i < current ? (
                <div className="h-full w-full bg-white rounded-full" />
              ) : i === current ? (
                <div
                  key={barKeyRef.current}
                  className="h-full bg-white rounded-full"
                  style={{
                    animation: paused
                      ? "none"
                      : `story-fill ${DURATION}ms linear forwards`,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Prev / Next tap zones (desktop arrows, mobile tap areas) */}
      {n > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute left-0 top-0 h-full w-1/3 z-10 flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity"
          >
            <span className="w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center text-xl font-bold">
              ‹
            </span>
          </button>
          <button
            onClick={next}
            aria-label="Próxima foto"
            className="absolute right-0 top-0 h-full w-1/3 z-10 flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity"
          >
            <span className="w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center text-xl font-bold">
              ›
            </span>
          </button>
        </>
      )}

      {/* Counter pill */}
      {n > 1 && (
        <div className="absolute bottom-3 right-3 z-10 bg-black/40 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {current + 1} / {n}
        </div>
      )}
    </div>
  );
}
