"use client";

import { useState, useEffect } from "react";

const PLACES = [
  "Jericoacoara, CE",
  "São Miguel do Gostoso, RN",
  "Bonito, MS",
  "Chapada Diamantina, BA",
  "Fernando de Noronha, PE",
  "Morro de São Paulo, BA",
  "Lençóis Maranhenses, MA",
];

const TYPE_MS = 75;
const DELETE_MS = 38;
const PAUSE_TYPED = 1800;
const PAUSE_DELETED = 400;

export default function SearchBar() {
  const [value, setValue] = useState("");
  const [ghost, setGhost] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = PLACES[idx];

    if (!deleting) {
      if (charIdx < word.length) {
        const t = setTimeout(() => {
          setGhost(word.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, TYPE_MS);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setDeleting(true), PAUSE_TYPED);
        return () => clearTimeout(t);
      }
    } else {
      if (charIdx > 0) {
        const t = setTimeout(() => {
          setGhost(word.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, DELETE_MS);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setIdx((i) => (i + 1) % PLACES.length);
          setDeleting(false);
        }, PAUSE_DELETED);
        return () => clearTimeout(t);
      }
    }
  }, [charIdx, deleting, idx]);

  return (
    <div className="relative w-72">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E5E1DC] bg-[#F7F5F2] text-sm focus:outline-none focus:border-[#ff2924] focus:bg-white transition-colors"
      />

      {/* Animated ghost placeholder — hidden when user types */}
      {!value && (
        <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-[#aaa] pointer-events-none select-none whitespace-nowrap">
          {ghost}
          <span className="opacity-60">|</span>
        </span>
      )}
    </div>
  );
}
