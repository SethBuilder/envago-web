import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchProvider } from "../../lib/api";
import Navbar from "../../components/Navbar";
import ProviderActivities from "../../components/ProviderActivities";

export const dynamic = "force-dynamic";

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  let provider;
  try {
    const res = await fetchProvider(slug, isPreview);
    provider = res.data;
  } catch {
    notFound();
  }

  return (
    <>
      <Navbar />
      {isPreview && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          Pré-visualização — sua página ainda não está publicada. Ative sua conta para publicar.
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
            <h1 className="text-2xl font-bold text-[#111]">{provider.business_name}</h1>
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
