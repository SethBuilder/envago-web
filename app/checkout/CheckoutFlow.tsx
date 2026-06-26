"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { jsPDF } from "jspdf";
import Image from "next/image";
import Link from "next/link";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { ApiActivityDetail, ApiSchedule } from "../lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

interface BookingData {
  id: number;
  reference: string;
  guest_name: string;
  guest_email: string;
  seats: number;
  total_price: string;
  status: string;
  client_secret: string;
  activity: { name: string; slug: string; city: string };
  date: string;
  time: string;
}

// ── PDF generation ────────────────────────────────────────────────────────
async function loadLogoDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = "/logo.svg";
  });
}

async function buildPDF(booking: BookingData, dateLong: string): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const red: [number, number, number] = [255, 41, 36];
  const grey: [number, number, number] = [100, 100, 100];
  const dark: [number, number, number] = [17, 17, 17];
  const light: [number, number, number] = [247, 245, 242];

  // White header
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 24, "F");

  // Logo image (SVG rendered to canvas)
  try {
    const logoUrl = await loadLogoDataUrl();
    // original ratio: 826 × 247 → render at 40mm wide
    doc.addImage(logoUrl, "PNG", 12, 4, 40, 12);
  } catch {
    doc.setTextColor(...red);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("envago", 14, 16);
  }

  // Red accent bar
  doc.setFillColor(...red);
  doc.rect(0, 24, 210, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Confirmação de Reserva", 210 - 14, 28, { align: "right" });

  // Reference box
  doc.setFillColor(...light);
  doc.roundedRect(14, 38, 182, 22, 3, 3, "F");
  doc.setTextColor(...grey);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("CÓDIGO DA RESERVA", 105, 46, { align: "center" });
  doc.setTextColor(...dark);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(booking.reference, 105, 55, { align: "center" });

  // Details
  const rows: [string, string][] = [
    ["Passeio",  booking.activity.name],
    ["Data",     dateLong],
    ["Horário",  booking.time],
    ["Pessoas",  String(booking.seats)],
    ["Nome",     booking.guest_name],
    ["E-mail",   booking.guest_email],
    ["Total pago", `R$ ${Number(booking.total_price).toFixed(0)}`],
  ];

  let y = 74;
  rows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 249, 247);
      doc.rect(14, y - 6, 182, 14, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, 18, y);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(value, 18, y + 6);
    y += 18;
  });

  // Footer
  doc.setFillColor(...red);
  doc.rect(0, 280, 210, 17, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("envago.live  •  Obrigado pela sua reserva!", 105, 291, { align: "center" });

  return doc;
}

async function shareOrDownloadPDF(booking: BookingData, dateLong: string) {
  const doc = await buildPDF(booking, dateLong);
  const filename = `reserva-${booking.reference}.pdf`;

  if (navigator.canShare) {
    const blob = doc.output("blob");
    const file = new File([blob], filename, { type: "application/pdf" });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Reserva ${booking.reference}` });
      return;
    }
  }
  // Fallback: download
  doc.save(filename);
}

// ── Confetti burst on mount ────────────────────────────────────────────────
function ConfettiBurst() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 }, colors: ["#ff2924", "#ff6b6b", "#ffd700", "#00c896", "#4fc3f7"] });
  }, []);
  return null;
}

// ── Summary card (right column) ────────────────────────────────────────────
function SummaryCard({
  activity,
  schedule,
  seats,
  priceNum,
}: {
  activity: ApiActivityDetail;
  schedule: ApiSchedule;
  seats: number;
  priceNum: number;
}) {
  const coverUrl = activity.cover_url ?? `https://picsum.photos/seed/${activity.slug}/800/500`;
  const total = priceNum * seats;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1DC] overflow-hidden">
      <div className="relative w-full aspect-[16/9]">
        <Image src={coverUrl} alt={activity.name} fill className="object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-bold text-[#111] text-base leading-snug">{activity.name}</h2>
          {activity.avg_rating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-amber-400 text-sm">★</span>
              <span className="text-sm font-semibold text-[#111]">{activity.avg_rating}</span>
              <span className="text-sm text-[#999]">({activity.review_count} avaliações)</span>
            </div>
          )}
        </div>

        <div className="border-t border-[#F0EDE8] pt-4 flex flex-col gap-2.5">
          <div className="flex items-start gap-3">
            <span className="text-[#999] text-sm w-5 mt-0.5">📅</span>
            <span className="text-sm text-[#111] font-medium capitalize">{formatDateLong(schedule.date)}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#999] text-sm w-5 mt-0.5">🕐</span>
            <span className="text-sm text-[#111] font-medium">{schedule.time}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#999] text-sm w-5 mt-0.5">👤</span>
            <span className="text-sm text-[#111] font-medium">{seats} pessoa{seats > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="border-t border-[#F0EDE8] pt-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-sm text-[#666]">
            <span>R$ {priceNum.toFixed(0)} × {seats} pessoa{seats > 1 ? "s" : ""}</span>
            <span>R$ {total.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#111]">
            <span>Total</span>
            <span className="text-lg">R$ {total.toFixed(0)}</span>
          </div>
          <p className="text-[11px] text-[#999] mt-0.5">Todos os impostos incluídos</p>
        </div>
      </div>
    </div>
  );
}

// ── Stripe payment inner form ───────────────────────────────────────────────
function PaymentForm({
  booking,
  onConfirmed,
  onBack,
}: {
  booking: BookingData;
  onConfirmed: (b: BookingData) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixPending, setPixPending] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/bookings/${booking.reference}/status`);
      const { status } = await res.json();
      if (status === "confirmed") onConfirmed(booking);
    } catch {}
  }, [booking, onConfirmed]);

  useEffect(() => {
    if (!pixPending) return;
    const id = setInterval(pollStatus, 3000);
    return () => clearInterval(id);
  }, [pixPending, pollStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/passeio/${booking.activity.slug}?ref=${booking.reference}`,
        payment_method_data: {
          billing_details: { name: booking.guest_name, email: booking.guest_email },
        },
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Erro no pagamento.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      setTimeout(() => onConfirmed(booking), 1500);
    } else if (paymentIntent?.status === "requires_action") {
      setPixPending(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-[#111] mb-1">Pagamento</h2>
        <p className="text-sm text-[#666]">Seus dados estão protegidos por criptografia SSL</p>
      </div>

      <PaymentElement options={{ layout: "tabs", paymentMethodOrder: ["card", "pix"] }} />

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {pixPending && (
        <div className="flex items-center gap-2 text-sm text-[#666] justify-center py-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
          Aguardando pagamento PIX…
        </div>
      )}

      {!pixPending && (
        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="w-full bg-[#ff2924] text-white font-bold py-4 rounded-xl hover:bg-[#d41f1b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {loading ? "Processando…" : `Pagar R$ ${Number(booking.total_price).toFixed(0)}`}
        </button>
      )}

      <button type="button" onClick={onBack}
        className="text-sm text-[#999] hover:text-[#111] text-center transition-colors cursor-pointer">
        ← Voltar e editar dados
      </button>
    </form>
  );
}

// ── Main checkout flow ──────────────────────────────────────────────────────
export default function CheckoutFlow({
  activity,
  schedule,
  seats,
}: {
  activity: ApiActivityDetail;
  schedule: ApiSchedule;
  seats: number;
}) {
  const priceNum = Number(activity.price);
  const total = priceNum * seats;

  const [step, setStep] = useState<"contact" | "payment" | "confirmed">("contact");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);

  const elementsOptions = booking?.client_secret
    ? {
        clientSecret: booking.client_secret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#ff2924",
            colorBackground: "#ffffff",
            colorText: "#111111",
            borderRadius: "12px",
            fontFamily: "Raleway, sans-serif",
          },
        },
        fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap" }],
      }
    : undefined;

  async function submitContact(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule_id: schedule.id, seats, guest_name: guestName, guest_email: guestEmail }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? "Algo deu errado."); return; }
      setBooking(json.data);
      setStep("payment");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Confirmed ─────────────────────────────────────────────────────────────
  if (step === "confirmed" && booking) {
    return (
      <div className="min-h-screen bg-[#EFEDE8]">
        <ConfettiBurst />
        <header className="bg-white border-b border-[#E5E1DC] px-6 py-4">
          <Link href="/"><Image src="/logo.svg" alt="Envago" width={140} height={40} priority className="h-11 w-auto" /></Link>
        </header>
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-[#E5E1DC] overflow-hidden">
            <div className="bg-green-100 border-b border-green-200 px-6 py-6 flex flex-col items-center text-center gap-3">
              <div className="text-5xl">🎉</div>
              <div>
                <h1 className="font-bold text-2xl text-[#111]">Tudo certo, {booking.guest_name.split(" ")[0]}!</h1>
                <p className="text-sm text-[#666] mt-2">
                  Sua reserva está confirmada. Enviamos os detalhes para{" "}
                  <span className="font-semibold text-[#111]">{booking.guest_email}</span>.
                </p>
              </div>
              <div className="bg-white border border-green-200 rounded-xl px-6 py-3 mt-1">
                <p className="text-[10px] text-[#999] uppercase tracking-widest mb-1">Código da reserva</p>
                <p className="font-bold text-2xl text-[#111] tracking-[0.2em]">{booking.reference}</p>
              </div>
            </div>
            <div className="px-6 py-5 flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[#999] uppercase tracking-wide">Passeio</span>
                <span className="font-semibold text-[#111]">{booking.activity.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-[#999] uppercase tracking-wide">Data</span>
                  <span className="font-semibold text-[#111] capitalize text-sm">{formatDateLong(booking.date)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-[#999] uppercase tracking-wide">Horário</span>
                  <span className="font-semibold text-[#111] text-sm">{booking.time}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-[#999] uppercase tracking-wide">Pessoas</span>
                  <span className="font-semibold text-[#111] text-sm">{booking.seats}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-[#999] uppercase tracking-wide">Total pago</span>
                  <span className="font-bold text-[#111] text-sm">R$ {Number(booking.total_price).toFixed(0)}</span>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <button
                  onClick={() => shareOrDownloadPDF(booking, formatDateLong(booking.date))}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#E5E1DC] rounded-xl py-3 text-sm font-semibold text-[#111] hover:border-[#ff2924] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartilhar / Baixar PDF
                </button>
                <Link href={`/passeio/${activity.slug}`}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#E5E1DC] rounded-xl py-3 text-sm font-semibold text-[#111] hover:border-[#ff2924] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar para o passeio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Two-column layout ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EFEDE8]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E1DC] px-6 py-4">
        <Link href="/"><Image src="/logo.svg" alt="Envago" width={140} height={40} priority className="h-11 w-auto" /></Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: form */}
        <div className="flex flex-col gap-6">
          {/* Step indicator */}
          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center gap-2 font-semibold ${step === "contact" ? "text-[#111]" : "text-green-700"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "contact" ? "bg-[#ff2924] text-white" : "bg-green-500 text-white"}`}>
                {step === "contact" ? "1" : "✓"}
              </span>
              Seus dados
            </div>
            <span className="text-[#bbb] font-bold tracking-widest">——</span>
            <div className={`flex items-center gap-2 font-semibold ${step === "payment" ? "text-[#111]" : "text-[#777]"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "payment" ? "bg-[#ff2924] text-white" : "bg-[#999] text-white"}`}>
                2
              </span>
              Pagamento
            </div>
          </div>

          {/* Contact form */}
          {step === "contact" && (
            <div className="bg-white rounded-2xl border border-[#E5E1DC] p-6">
              <h2 className="text-xl font-bold text-[#111] mb-1">Para onde enviar a confirmação?</h2>
              <p className="text-sm text-[#666] mb-6">Você receberá os detalhes da reserva por e-mail</p>

              <form onSubmit={submitContact} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="guest_name" className="text-sm font-semibold text-[#111]">Nome completo</label>
                  <input id="guest_name" name="name" type="text" value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Como está no seu documento"
                    autoComplete="name" required
                    className="border-2 border-[#E5E1DC] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff2924] transition-colors placeholder:text-[#bbb]" />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="guest_email" className="text-sm font-semibold text-[#111]">E-mail</label>
                  <input id="guest_email" name="email" type="email" value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email" required
                    className="border-2 border-[#E5E1DC] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff2924] transition-colors placeholder:text-[#bbb]" />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full bg-[#ff2924] text-white font-bold py-4 rounded-xl hover:bg-[#d41f1b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base mt-1">
                  {loading ? "Aguarde…" : "Continuar para pagamento →"}
                </button>
              </form>

              <p className="text-[11px] text-[#bbb] text-center mt-4">
                Ao continuar você concorda com nossos{" "}
                <span className="underline cursor-pointer">Termos de uso</span> e{" "}
                <span className="underline cursor-pointer">Política de privacidade</span>.
              </p>
            </div>
          )}

          {/* Payment */}
          {step === "payment" && booking && elementsOptions && (
            <div className="bg-white rounded-2xl border border-[#E5E1DC] p-6">
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm
                  booking={booking}
                  onConfirmed={(b) => { setBooking(b); setStep("confirmed"); }}
                  onBack={() => setStep("contact")}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Right: summary card */}
        <div className="lg:sticky lg:top-8">
          <SummaryCard activity={activity} schedule={schedule} seats={seats} priceNum={priceNum} />
        </div>
      </div>
    </div>
  );
}
