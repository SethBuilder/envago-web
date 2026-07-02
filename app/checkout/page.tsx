import { redirect } from "next/navigation";
import Script from "next/script";
import { fetchActivity } from "../lib/api";
import CheckoutFlow from "./CheckoutFlow";

export const dynamic = "force-dynamic";

export const metadata = { title: "Reserva | Envago" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string; schedule?: string; seats?: string }>;
}) {
  const { activity: slug, schedule: scheduleIdRaw, seats: seatsRaw } = await searchParams;

  if (!slug || !scheduleIdRaw) redirect("/");

  const scheduleId = parseInt(scheduleIdRaw, 10);
  const seats = Math.max(1, parseInt(seatsRaw ?? "1", 10) || 1);

  let activity;
  try {
    const res = await fetchActivity(slug, true);
    activity = res.data;
  } catch {
    redirect("/");
  }

  const schedule = activity.schedules.find((s) => s.id === scheduleId);
  if (!schedule) redirect(`/passeio/${slug}`);

  const checkoutTotal = (Number(activity.price) * seats).toFixed(2);

  return (
    <>
      <Script id="gtag-conversion-checkout" strategy="afterInteractive">
        {`gtag('event', 'conversion', { 'send_to': 'AW-18282842253/hykQCOHVq8kcEI2R-I1E', 'value': ${checkoutTotal}, 'currency': 'BRL' });`}
      </Script>
      <CheckoutFlow activity={activity} schedule={schedule} seats={seats} />
    </>
  );
}
