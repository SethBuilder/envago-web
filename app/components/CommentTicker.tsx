"use client";

import { useState, useEffect } from "react";
import type { ApiReview } from "../lib/api";

const ROW = 26;

const avatarColors = [
  "bg-[#ff2924]",
  "bg-[#0066CC]",
  "bg-[#007A4D]",
  "bg-[#7B4FE9]",
  "bg-[#D97706]",
];

export default function CommentTicker({ reviews }: { reviews: ApiReview[] }) {
  const n = reviews.length;
  const [pos, setPos] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (n < 2) return;
    const id = setInterval(() => setAnimating(true), 3200);
    return () => clearInterval(id);
  }, [n]);

  function handleTransitionEnd() {
    setAnimating(false);
    setPos((p) => (p + 1) % n);
  }

  if (n === 0) return null;

  const items = [0, 1, 2].map((i) => reviews[(pos + i) % n]);

  return (
    <div style={{ height: ROW * 2, overflow: "hidden" }}>
      <div
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: animating ? `translateY(-${ROW}px)` : "translateY(0)",
          transition: animating ? "transform 0.35s ease" : "none",
        }}
      >
        {items.map((r, i) => (
          <div
            key={`${pos}-${i}`}
            className="flex items-center gap-2"
            style={{ height: ROW }}
          >
            <span
              className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold ${
                avatarColors[(pos + i) % avatarColors.length]
              }`}
            >
              {r.author_name.charAt(0).toUpperCase()}
            </span>
            <p className="text-[11px] text-white/90 leading-none overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="font-semibold text-white">{r.author_name.split(" ")[0]}</span>{" "}
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
