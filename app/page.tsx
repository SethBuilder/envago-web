import Navbar from "./components/Navbar";
import Feed from "./components/Feed";
import { fetchActivities, fetchArticles, fetchCategories, fetchStories } from "./lib/api";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categoria } = await searchParams;
  const initialCategory = typeof categoria === "string" ? categoria : "todos";

  const isGuias = initialCategory === "guias";

  const [activitiesResult, apiCategories, articlesResult, storiesResult] = await Promise.all([
    isGuias ? Promise.resolve({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } }) : fetchActivities({ category: initialCategory }),
    fetchCategories(),
    isGuias ? fetchArticles() : Promise.resolve({ data: [] }),
    isGuias ? fetchStories() : Promise.resolve({ data: [] }),
  ]);

  const { data: initialActivities, meta } = activitiesResult;
  const { data: initialArticles } = articlesResult;
  const { data: initialStories } = storiesResult;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Envago",
            url: "https://envago.live",
            logo: "https://envago.live/design/logo-novo.svg",
            description: "Marketplace de passeios e experiências de viagem no Brasil.",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Envago",
            url: "https://envago.live",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://envago.live/?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <Navbar />

      <main className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111] leading-tight">
            Descubra Passeios e
            <br />
            <span className="text-[#ff2924]">Aventuras no Brasil</span>
          </h1>
          <p className="mt-3 text-[#666] text-base sm:text-lg max-w-xl">
            Reserve online, pague com segurança e viva experiências inesquecíveis.
            Do kitesurf em Jericoacoara às trilhas do Pantanal.
          </p>
        </div>

        <Feed initialActivities={initialActivities} initialMeta={meta} apiCategories={apiCategories} initialCategory={initialCategory} initialArticles={initialArticles} initialStories={initialStories} />

        <section id="como-funciona" className="mt-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5E1DC]">
            <h2 className="text-2xl font-bold text-[#111] mb-8 text-center">Como funciona</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { icon: "🔍", step: "01", title: "Encontre o passeio", desc: "Busque por destino, tipo de aventura ou data. Centenas de opções em todo Brasil." },
                { icon: "📱", step: "02", title: "Reserve online", desc: "Pague com PIX ou cartão. Receba confirmação na hora. Sem burocracia." },
                { icon: "🌄", step: "03", title: "Viva a aventura", desc: "Apareça no horário marcado e aproveite. O operador já sabe que você vem." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center gap-3">
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-xs font-bold text-[#ff2924] tracking-widest">PASSO {item.step}</span>
                  <h3 className="font-semibold text-[#111]">{item.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

    </>
  );
}
