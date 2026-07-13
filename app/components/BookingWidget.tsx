"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ApiSchedule } from "../lib/api";

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_PT   = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function toLocalDate(str: string) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function labelDate(str: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const tom   = new Date(today); tom.setDate(today.getDate()+1);
  const d = toLocalDate(str);
  if (d.getTime() === today.getTime()) return "Hoje";
  if (d.getTime() === tom.getTime())   return "Amanhã";
  return d.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" });
}

async function logClick(activityId: number) {
  try {
    await fetch("/api/v1/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity_id: activityId }),
    });
  } catch {}
}

export default function BookingWidget({ price, pricingType = "per_person", pricingUnit, unitCapacity, schedules, activitySlug, activityName, activityId, bookingMethod = "envago", linkUrl, stripeReady = true }: {
  price: string;
  pricingType?: "per_person" | "per_unit";
  pricingUnit?: string | null;
  unitCapacity?: number | null;
  schedules: ApiSchedule[];
  activitySlug: string;
  activityName?: string;
  activityId: number;
  bookingMethod?: "envago" | "affiliate" | "lead";
  linkUrl?: string | null;
  stripeReady?: boolean;
}) {
  const router = useRouter();
  const priceNum = Number(price);
  const isPerUnit = pricingType === "per_unit";
  const unitLabel = isPerUnit ? (pricingUnit ?? "grupo") : "pessoa";

  const byDate = schedules.reduce<Record<string, ApiSchedule[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const today = new Date(); today.setHours(0,0,0,0);
  const todayKey    = dateKey(today);
  const tomorrowKey = dateKey(new Date(today.getTime() + 86400000));

  const [selectedDate,     setSelectedDate]     = useState<string>("");
  const [selectedSchedule, setSelectedSchedule] = useState<ApiSchedule | null>(null);
  const [_seats,           setSeats]            = useState(1);
  const [calOpen,          setCalOpen]          = useState(false);
  const calRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    }
    if (calOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [calOpen]);

  // Calendar state
  const [calMonth, setCalMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const maxSeats      = selectedSchedule?.seats_left ?? 0;
  const seats         = _seats;
  const total         = priceNum * seats;
  const unitPlural    = isPerUnit ? `${unitLabel}s` : "pessoas";
  const totalPeople   = isPerUnit && unitCapacity ? seats * unitCapacity : null;

  function selectDate(date: string) {
    setSelectedDate(date);
    const first = (byDate[date] ?? []).find((s) => s.seats_left > 0) ?? byDate[date]?.[0] ?? null;
    setSelectedSchedule(first);
    if (first) setSeats(s => Math.max(1, Math.min(s, first.seats_left)));
    setCalOpen(false);
  }

  function goToCheckout() {
    if (!selectedSchedule) return;
    router.push(`/checkout?activity=${activitySlug}&schedule=${selectedSchedule.id}&seats=${seats}`);
  }


  function prevMonth() {
    setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  // Build calendar grid
  function buildCalendarDays() {
    const year  = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const startDow = first.getDay(); // 0=Sun
    const days: Array<Date | null> = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }

  // Affiliate booking — external link, straight to partner site
  if (bookingMethod === "affiliate" && linkUrl) {
    return (
      <div id="booking-widget" className="bg-white border border-[#E5E1DC] rounded-2xl p-6 flex flex-col gap-4 sticky top-24">
        <div>
          <span className="text-3xl font-bold text-[#111]">R$ {priceNum.toFixed(0)}</span>
          <span className="text-[#666] text-sm"> /{unitLabel}</span>
        </div>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => logClick(activityId)}
          className="w-full flex items-center justify-center gap-2 bg-[#ff2924] text-white font-bold py-3 rounded-xl hover:bg-[#d41f1b] transition-colors"
        >
          Ver disponibilidade
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
        <p className="text-center text-xs text-[#999]">Você será redirecionado para o site do parceiro</p>
      </div>
    );
  }

  // No schedules / not yet approved
  if (!stripeReady || schedules.length === 0) {
    return (
      <div id="booking-widget" className="bg-white border border-[#E5E1DC] rounded-2xl p-6 flex flex-col gap-4 sticky top-24 text-center">
        <div>
          <span className="text-3xl font-bold text-[#111]">R$ {priceNum.toFixed(0)}</span>
          <span className="text-[#444] text-sm font-medium"> /{unitLabel}</span>
        </div>
        <div className="bg-[#fff8e1] rounded-xl p-4">
          <p className="font-semibold text-[#92400e] text-sm">Reservas em breve</p>
          <p className="text-xs text-[#a16207] mt-1">Este passeio estará disponível para reserva em breve.</p>
        </div>
      </div>
    );
  }

  const calDays = buildCalendarDays();

  return (
    <div id="booking-widget" className="bg-white border border-[#E5E1DC] rounded-2xl p-6 flex flex-col gap-5 sticky top-24">
      <div>
        <span className="text-3xl font-bold text-[#111]">R$ {priceNum.toFixed(0)}</span>
        <span className="text-[#666] text-sm"> /{unitLabel}</span>
        {isPerUnit && unitCapacity && (
          <span className="text-[#666] text-sm"> · até {unitCapacity} pessoas</span>
        )}
      </div>

      {/* Date picker */}
      <div className="relative" ref={calRef}>
        <button onClick={() => setCalOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-[#111] hover:bg-[#f9f9f9] transition-colors cursor-pointer bg-white">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#111] shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className={selectedDate ? "font-extrabold text-[#111] text-base" : "font-bold text-[#555] text-base"}>
              {selectedDate
                ? toLocalDate(selectedDate).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
                : "Escolha uma data"}
            </span>
          </div>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            className={`text-[#111] transition-transform shrink-0 ${calOpen ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {calOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#E5E1DC] rounded-xl shadow-lg p-3">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#f5f5f5] text-[#555] cursor-pointer transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="text-base font-extrabold text-[#111] tracking-tight">{MONTHS_PT[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
              <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#f5f5f5] text-[#555] cursor-pointer transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_PT.map(d => (
                <div key={d} className="text-[11px] font-bold text-[#999] py-1">{d}</div>
              ))}
              {calDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const key  = dateKey(day);
                const past = day < today;
                const hasSlots  = !!byDate[key];
                const soldOut   = hasSlots && byDate[key].every(s => s.seats_left === 0);
                const available = hasSlots && !soldOut;
                const isSelected = selectedDate === key;
                return (
                  <button key={key}
                    onClick={() => available && selectDate(key)}
                    disabled={!available || past}
                    className={`relative aspect-square rounded-xl text-sm font-bold transition-all cursor-pointer
                      ${isSelected ? "bg-[#ff2924] text-white shadow-sm" :
                        available ? "hover:bg-[#fff0f0] text-[#111]" :
                        soldOut   ? "text-[#ccc] line-through cursor-not-allowed" :
                        "text-[#ddd] cursor-default"}
                    `}>
                    {day.getDate()}
                    {available && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Time slots */}
      {selectedDate && byDate[selectedDate] && (
        <div>
          <p className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2">Horário</p>
          <div className="flex gap-2 flex-wrap">
            {byDate[selectedDate].map((s) => (
              <button key={s.id} onClick={() => { setSelectedSchedule(s); setSeats(prev => Math.max(1, Math.min(prev, s.seats_left))); }} disabled={s.seats_left === 0}
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

      {/* Pax / unit selector */}
      <div>
        <p className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2">
          {isPerUnit
            ? (_seats === 1 ? unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1) : unitPlural.charAt(0).toUpperCase() + unitPlural.slice(1))
            : "Pessoas"}
        </p>
        <div className="flex items-center gap-4">
          <button onClick={() => setSeats((s) => Math.max(1, s - 1))}
            className="w-9 h-9 rounded-full border border-[#999] text-xl font-bold hover:border-[#ff2924] transition-all cursor-pointer">−</button>
          <span className="text-lg font-bold w-4 text-center">{_seats}</span>
          <button onClick={() => setSeats((s) => Math.min(selectedSchedule ? maxSeats : 99, s + 1))}
            className="w-9 h-9 rounded-full border border-[#999] text-xl font-bold hover:border-[#ff2924] transition-all cursor-pointer">+</button>
          {selectedSchedule && <span className="text-xs text-[#999]">máx. {maxSeats}</span>}
        </div>
        {isPerUnit && totalPeople && seats > 1 && (
          <p className="text-sm text-[#444] font-medium mt-2">até {totalPeople} pessoas no total</p>
        )}
      </div>

      <div className="border-t border-[#F0EDE8] pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#444] font-medium">
            R$ {priceNum.toFixed(0)} × {_seats} {_seats > 1 ? unitPlural : unitLabel}
          </span>
          <span className="font-bold text-[#111] text-base">R$ {total.toFixed(0)}</span>
        </div>
        <button
          disabled={maxSeats === 0 && !!selectedSchedule}
          onClick={() => {
            if (!selectedSchedule) { setCalOpen(true); return; }
            goToCheckout();
          }}
          className="w-full bg-[#ff2924] text-white font-bold py-3 rounded-xl hover:bg-[#d41f1b] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          Reservar agora
        </button>
        {maxSeats === 0 && selectedSchedule ? (
          <p className="text-center text-xs text-red-500">Este horário está esgotado — escolha outro.</p>
        ) : bookingMethod === "lead" ? (
          <p className="text-center text-xs text-[#999]">Confirme pelo WhatsApp do operador</p>
        ) : (
          <p className="text-center text-xs text-[#999]">Você não será cobrado agora</p>
        )}
      </div>
    </div>
  );
}
