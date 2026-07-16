import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchProvider } from "../../lib/api";
import Navbar from "../../components/Navbar";
import ProviderActivities from "../../components/ProviderActivities";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await fetchProvider(slug);
    const title = `${data.business_name} | Envago`;
    const city = data.activities[0]?.city;
    const description = `Reserve passeios com ${data.business_name}${city ? ` em ${city}` : ""} no Envago. Pague online, confirme na hora.`;
    const url = `https://envago.live/operadores/${slug}`;
    return {
      title,
      description,
      alternates: { canonical: url },
      // Keep unapproved pages out of search indexes
      robots: data.is_approved ? undefined : { index: false, follow: false },
      openGraph: {
        title,
        description,
        url,
        type: "website",
        locale: "pt_BR",
        siteName: "Envago",
        ...(data.logo_url ? { images: [{ url: data.logo_url, alt: data.business_name }] } : {}),
      },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    return { title: "Operador | Envago" };
  }
}

export default async function OperadorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let provider;
  try {
    const res = await fetchProvider(slug);
    provider = res.data;
  } catch {
    notFound();
  }

  const city    = provider.activities[0]?.city;
  const state   = provider.activities[0]?.state;
  const category = provider.activities[0]?.category?.name;

  const pageUrl = `https://envago.live/operadores/${slug}`;
  const metaDescription = `Reserve passeios com ${provider.business_name}${city ? ` em ${city}` : ""} no Envago. Pague online, confirme na hora.`;

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TravelAgency"],
    name: provider.business_name,
    url: pageUrl,
    image: provider.logo_url ?? "https://envago.live/design/logo-novo.svg",
    description: metaDescription,
    ...(city ? {
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        ...(state ? { addressRegion: state } : {}),
        addressCountry: "BR",
      },
    } : {}),
    ...(provider.activities.length > 0 ? {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Passeios",
        itemListElement: provider.activities.map((a) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "TouristTrip",
            name: a.name,
            url: `https://envago.live/passeio/${a.slug}`,
          },
          price: Number(a.price).toFixed(2),
          priceCurrency: "BRL",
        })),
      },
    } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: "https://envago.live" },
      { "@type": "ListItem", position: 2, name: provider.business_name, item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />
      {!provider.is_approved && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-amber-800">
            <span className="text-lg flex-shrink-0">🕐</span>
            <div>
              <span className="font-semibold text-sm">Página em análise</span>
              <span className="text-sm text-amber-700"> — Esta página ainda está sendo analisada pela equipe do Envago. As reservas estarão disponíveis em breve.</span>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-20">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#999] mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#ff2924] transition-colors">Início</Link>
          <span>/</span>
          <span className="text-[#111]">{provider.business_name}</span>
        </nav>

        {/* Provider header */}
        <div className="flex items-center gap-5 mb-10">
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt={provider.business_name}
              className="w-16 h-16 rounded-2xl object-cover border border-[#E5E1DC] flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#ff2924] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {provider.business_name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#111]">{provider.business_name}</h1>
              {!provider.claimed && (
                <a
                  href={`https://painel.envago.live/parceiros?claim=${provider.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#999] border border-[#ddd] rounded-full px-3 py-1 hover:border-[#999] hover:text-[#555] transition-colors whitespace-nowrap"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  Não reivindicado · É você? Crie sua conta
                </a>
              )}
            </div>
            <p className="text-sm text-[#999] mt-1">
              {provider.activities[0]?.city && `${provider.activities[0].city}, ${provider.activities[0].state}`}
            </p>
          </div>
        </div>

        <ProviderActivities
          activities={provider.activities}
          stripeReady={provider.booking_enabled}
        />
      </main>
    </>
  );
}
