import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchActivity } from "../../lib/api";

export const dynamic = "force-dynamic";
import BookingWidget from "../../components/BookingWidget";
import PhotoCarousel from "../../components/PhotoCarousel";
import Navbar from "../../components/Navbar";

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await fetchActivity(slug);
    const title = `${data.name} em ${data.city} | Envago`;
    const description = data.description ?? `Reserve ${data.name} em ${data.city}, ${data.state}. A partir de R$ ${Number(data.price).toFixed(0)}.`;
    const url = `https://envago.live/passeio/${slug}`;
    const image = data.cover_url ?? undefined;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "website",
        locale: "pt_BR",
        siteName: "Envago",
        ...(image ? { images: [{ url: image, alt: data.name }] } : {}),
      },
      twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
    };
  } catch {
    return { title: "Passeio | Envago" };
  }
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let activity;
  try {
    const res = await fetchActivity(slug);
    activity = res.data;
  } catch {
    notFound();
  }

  const photos = [
    activity.cover_url,
    ...activity.gallery,
  ].filter(Boolean) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: activity.name,
    description: activity.description ?? undefined,
    url: `https://envago.live/passeio/${activity.slug}`,
    image: photos[0] ?? undefined,
    touristType: activity.category?.name ?? undefined,
    offers: {
      "@type": "Offer",
      price: Number(activity.price).toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `https://envago.live/passeio/${activity.slug}`,
    },
    provider: activity.provider ? {
      "@type": "TouristInformationCenter",
      name: activity.provider.business_name,
      url: `https://envago.live/operadores/${activity.provider.slug}`,
    } : undefined,
    ...(activity.avg_rating ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: activity.avg_rating,
        reviewCount: activity.review_count,
      },
    } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#999] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#ff2924] transition-colors">Início</Link>
          <span>/</span>
          <span>{activity.category?.name ?? "Passeios"}</span>
          <span>/</span>
          <span className="text-[#111]">{activity.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Photo carousel */}
            <PhotoCarousel photos={photos} alt={activity.name} />

            {/* Title + meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {activity.category && (
                  <span className="text-xs font-bold bg-[#fff0f0] text-[#ff2924] px-3 py-1 rounded-full">
                    {activity.category.name}
                  </span>
                )}
                {activity.avg_rating && (
                  <span className="text-xs text-[#666] flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <strong className="text-[#111]">{activity.avg_rating}</strong>
                    ({activity.review_count} avaliações)
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111] leading-tight">
                {activity.name}
              </h1>
              <p className="mt-2 text-[#666] flex items-center gap-1">
                📍 {activity.city}, {activity.state}
              </p>
            </div>

            {/* Quick info chips */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "⏱", label: formatDuration(activity.duration_minutes) },
                { icon: "👥", label: `Até ${activity.capacity} pessoas` },
                { icon: "🏷️", label: `A partir de R$ ${Number(activity.price).toFixed(0)}` },
                { icon: "📍", label: `${activity.city}, ${activity.state}` },
              ].map((chip) => (
                <div key={chip.label} className="flex items-center gap-2 bg-[#F7F5F2] px-4 py-2 rounded-full text-sm text-[#444]">
                  <span>{chip.icon}</span>
                  <span className="font-medium">{chip.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {activity.description && (
              <div>
                <h2 className="text-lg font-bold text-[#111] mb-3">Sobre este passeio</h2>
                <p className="text-[#555] leading-relaxed">{activity.description}</p>
              </div>
            )}

            {/* Provider */}
            {activity.provider && (
              <Link href={`/operadores/${activity.provider.slug}`} className="bg-[#F7F5F2] rounded-2xl p-5 flex items-center gap-4 hover:bg-[#f0ede8] transition-colors">
                {activity.provider.logo_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#E5E1DC]">
                    <img
                      src={activity.provider.logo_url}
                      alt={activity.provider.business_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#ff2924] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {activity.provider.business_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs text-[#999] uppercase tracking-wide">Operador</p>
                  <p className="font-semibold text-[#111]">{activity.provider.business_name}</p>
                </div>
                <span style={{color: '#aaa', fontSize: '18px'}}>›</span>
              </Link>
            )}

            {/* Reviews */}
            {activity.reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#111] mb-4">
                  Avaliações
                  {activity.avg_rating && (
                    <span className="ml-2 text-amber-400">★</span>
                  )}
                  {activity.avg_rating && (
                    <span className="text-base font-normal text-[#666] ml-1">
                      {activity.avg_rating} · {activity.review_count} avaliações
                    </span>
                  )}
                </h2>
                <div className="flex flex-col gap-4">
                  {activity.reviews.map((r, i) => (
                    <div key={i} className="border-b border-[#F0EDE8] pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#E5E1DC] flex items-center justify-center text-sm font-bold text-[#666]">
                          {r.author_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111]">{r.author_name}</p>
                          <p className="text-xs text-[#999]">{r.created_at}</p>
                        </div>
                        <div className="ml-auto flex">
                          {[...Array(5)].map((_, j) => (
                            <span key={j} className={j < r.rating ? "text-amber-400" : "text-[#E5E1DC]"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#555] leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: booking widget */}
          <div className="lg:col-span-1">
            <BookingWidget
            price={activity.price}
            schedules={activity.schedules}
            activitySlug={activity.slug}
            stripeReady={activity.provider?.booking_enabled ?? false}
          />
          </div>
        </div>
      </main>
    </>
  );
}
