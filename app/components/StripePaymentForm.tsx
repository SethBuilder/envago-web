"use client";

import { useState, useEffect, useCallback } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

interface Confirmation {
  reference: string;
  guest_name: string;
  guest_email: string;
  seats: number;
  total_price: string;
  activity: { name: string; slug: string; city: string };
  date: string;
  time: string;
}

export default function StripePaymentForm({
  confirmation,
  onConfirmed,
  onBack,
}: {
  confirmation: Confirmation;
  onConfirmed: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixPending, setPixPending] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/bookings/${confirmation.reference}/status`);
      const { status } = await res.json();
      if (status === "confirmed") onConfirmed();
    } catch {}
  }, [confirmation.reference, onConfirmed]);

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
        return_url: `${window.location.origin}/passeio/${confirmation.activity.slug}?ref=${confirmation.reference}`,
        payment_method_data: {
          billing_details: { name: confirmation.guest_name, email: confirmation.guest_email },
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
      setTimeout(onConfirmed, 1500);
    } else if (paymentIntent?.status === "requires_action") {
      // PIX — Payment Element shows QR code inline, start polling
      setPixPending(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#111] transition-colors cursor-pointer w-fit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      {/* Booking summary */}
      <div className="bg-[#F7F5F2] rounded-xl p-4 text-sm flex flex-col gap-1.5">
        <p className="font-bold text-[#111]">{confirmation.activity.name}</p>
        <p className="text-[#666] capitalize">{formatDateLong(confirmation.date)} · {confirmation.time}</p>
        <p className="text-[#666]">
          {confirmation.seats} pessoa{confirmation.seats > 1 ? "s" : ""}
          {" · "}
          <span className="font-bold text-[#111]">R$ {Number(confirmation.total_price).toFixed(0)}</span>
        </p>
        <p className="text-[#999] text-xs">{confirmation.guest_name} · {confirmation.guest_email}</p>
      </div>

      {/* Stripe Payment Element */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "pix"],
          }}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
        )}

        {pixPending && (
          <div className="flex items-center gap-2 text-sm text-[#666] justify-center">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
            Aguardando pagamento PIX…
          </div>
        )}

        {!pixPending && (
          <button
            type="submit"
            disabled={loading || !stripe || !elements}
            className="w-full bg-[#ff2924] text-white font-bold py-3 rounded-xl hover:bg-[#d41f1b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processando…" : `Pagar R$ ${Number(confirmation.total_price).toFixed(0)}`}
          </button>
        )}
      </form>
    </div>
  );
}
