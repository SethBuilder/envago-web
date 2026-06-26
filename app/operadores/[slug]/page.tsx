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
    return {
      title: `${data.business_name} | Envago`,
      description: `Reserve passeios com ${data.business_name} no Envago.`,
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

  return (
    <>
      <Navbar />
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
