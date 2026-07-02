"use client";

import { useEffect, useState } from "react";

export default function MobileStickyFooter({ price, pricingUnit, bookingEnabled }: {
  price: string;
  pricingUnit?: string | null;
  bookingEnabled: boolean;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById("booking-widget-mobile");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function scrollToWidget() {
    document.getElementById("booking-widget-mobile")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!visible) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E1DC] px-4 py-3 flex items-center gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-[#111] leading-none">
          R$ {Number(price).toFixed(0)}
          <span className="text-sm font-normal text-[#999] ml-1">/{pricingUnit ?? "pessoa"}</span>
        </p>
      </div>
      {bookingEnabled ? (
        <button onClick={scrollToWidget}
          className="flex-shrink-0 bg-[#ff2924] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#d41f1b] transition-colors cursor-pointer">
          Reservar agora
        </button>
      ) : (
        <div className="flex-shrink-0 bg-[#f5f5f5] text-[#999] font-semibold px-6 py-3 rounded-xl text-sm">
          Em breve
        </div>
      )}
    </div>
  );
}
