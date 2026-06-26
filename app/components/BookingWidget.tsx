"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiSchedule } from "../lib/api";

function formatDate(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const d = new Date(dateStr + "T00:00:00");
  if (d.getTime() === today.getTime()) return "Hoje";
  if (d.getTime() === tomorrow.getTime()) return "Amanhã";
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

export default function BookingWidget({ price, schedules, activitySlug, stripeReady = true }: {
  price: string;
  schedules: ApiSchedule[];
  activitySlug: string;
  stripeReady?: boolean;
}) {
  const router = useRouter();
  const priceNum = Number(price);

  const byDate = schedules.reduce<Record<string, ApiSchedule[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const dates = Object.keys(byDate);

  const firstAvailable = schedules.find((s) => s.seats_left > 0) ?? null;
  const [selectedDate, setSelectedDate] = useState<string>(firstAvailable?.date ?? dates[0] ?? "");
  const [selectedSchedule, setSelectedSchedule] = useState<ApiSchedule | null>(firstAvailable);
  const [seats, setSeats] = useState(1);

  const maxSeats = selectedSchedule?.seats_left ?? 0;
  const total = priceNum * seats;

  function selectDate(date: string) {
    setSelectedDate(date);
    const first = byDate[date].find((s) => s.seats_left > 0) ?? byDate[date][0];
    setSelectedSchedule(first);
    setSeats(1);
  }

  function goToCheckout() {
    if (!selectedSchedule) return;
    router.push(`/checkout?activity=${activitySlug}&schedule=${selectedSchedule.id}&seats=${seats}`);
  }

  if (!stripeReady || schedules.length === 0) {
    return (
      <div className="bg-white border border-[#E5E1DC] rounded-2xl p-6 flex flex-col gap-4 sticky top-24 text-center">
        <div>
          <span className="text-3xl font-bold text-[#111]">R$ {priceNum.toFixed(0)}</span>
          <span className="text-[#666] text-sm"> /pessoa</span>
        </div>
        <div className="bg-[#fff8e1] rounded-xl p-4">
          <p className="font-semibold text-[#92400e] text-sm">Reservas em breve</p>
          <p className="text-xs text-[#a16207] mt-1">Este passeio estará disponível para reserva em breve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E1DC] rounded-2xl p-6 flex flex-col gap-5 sticky top-24">
      <div>
        <span className="text-3xl font-bold text-[#111]">R$ {priceNum.toFixed(0)}</span>
        <span className="text-[#666] text-sm"> /pessoa</span>
      </div>

      <div>
        <p className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2">Escolha a data</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {dates.slice(0, 10).map((date) => {
            const soldOut = byDate[date].every((s) => s.seats_left === 0);
            return (
              <button key={date} onClick={() => !soldOut && selectDate(date)} disabled={soldOut}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  soldOut ? "border-[#E5E1DC] text-[#ccc] cursor-not-allowed line-through"
                  : selectedDate === date ? "bg-[#ff2924] text-white border-[#ff2924] cursor-pointer"
                  : "border-[#E5E1DC] text-[#555] hover:border-[#ff2924] cursor-pointer"
                }`}>
                {formatDate(date)}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div>
          <p className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2">Horário</p>
          <div className="flex gap-2 flex-wrap">
            {byDate[selectedDate].map((s) => (
              <button key={s.id} onClick={() => { setSelectedSchedule(s); setSeats(1); }} disabled={s.seats_left === 0}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  s.seats_left === 0 ? "border-[#E5E1DC] text-[#bbb] cursor-not-allowed"
                  : selectedSchedule?.id === s.id ? "bg-[#ff2924] text-white border-[#ff2924] cursor-pointer"
                  : "border-[#E5E1DC] text-[#555] hover:border-[#ff2924] cursor-pointer"
                }`}>
                {s.time}
                {s.seats_left <= 3 && s.seats_left > 0 && (
                  <span className="ml-1 text-[10px] text-[#ff2924] font-bold">{s.seats_left} vaga{s.seats_left > 1 ? "s" : ""}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSchedule && maxSeats > 0 && (
        <div>
          <p className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2">Pessoas</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="w-9 h-9 rounded-full border border-[#E5E1DC] text-xl font-bold hover:border-[#ff2924] transition-all cursor-pointer">−</button>
            <span className="text-lg font-bold w-4 text-center">{seats}</span>
            <button onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))}
              className="w-9 h-9 rounded-full border border-[#E5E1DC] text-xl font-bold hover:border-[#ff2924] transition-all cursor-pointer">+</button>
            <span className="text-xs text-[#999]">máx. {maxSeats} disponíveis</span>
          </div>
        </div>
      )}

      <div className="border-t border-[#F0EDE8] pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#666]">R$ {priceNum.toFixed(0)} × {seats} pessoa{seats > 1 ? "s" : ""}</span>
          <span className="font-bold text-[#111] text-base">R$ {total.toFixed(0)}</span>
        </div>
        <button
          disabled={!selectedSchedule || maxSeats === 0}
          onClick={goToCheckout}
          className="w-full bg-[#ff2924] text-white font-bold py-3 rounded-xl hover:bg-[#d41f1b] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          Reservar agora
        </button>
        {maxSeats === 0 && selectedSchedule ? (
          <p className="text-center text-xs text-red-500">Este horário está esgotado — escolha outro.</p>
        ) : (
          <p className="text-center text-xs text-[#999]">Você não será cobrado agora</p>
        )}
      </div>
    </div>
  );
}
