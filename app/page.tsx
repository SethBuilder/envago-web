import Navbar from "./components/Navbar";
import Feed from "./components/Feed";
import LaraButton from "./components/LaraButton";
import { fetchActivities, fetchCategories } from "./lib/api";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categoria } = await searchParams;
  const initialCategory = typeof categoria === "string" ? categoria : "todos";

  const [{ data: initialActivities, meta }, apiCategories] = await Promise.all([
    fetchActivities({ category: initialCategory }),
    fetchCategories(),
  ]);

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

        <Feed initialActivities={initialActivities} initialMeta={meta} apiCategories={apiCategories} initialCategory={initialCategory} />

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

        <section id="operadores" className="mt-12 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#ff2924] rounded-3xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Você é operador de passeios?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Cadastre seu tour gratuitamente. Sem mensalidade, sem taxa de setup.
              Você paga só quando vende — 10% por reserva gerada pela Envago.
            </p>
            <LaraButton />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E1DC] bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#999]">
          <span>© 2026 Elmughrabi LIMITED · Envago. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <a href="/privacidade" className="hover:text-[#111] transition-colors">Privacidade</a>
            <a href="/termos" className="hover:text-[#111] transition-colors">Termos de uso</a>
            <a href="/contato" className="hover:text-[#111] transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </>
  );
}
