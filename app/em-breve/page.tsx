import type { Metadata } from "next";

export const metadata: Metadata = { title: "Envago — Em breve" };

export default function ComingSoonPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500&display=swap" />
      <style>{`
        .cs-font { font-family: 'DM Serif Display', serif; }
        .cs-body-font { font-family: 'Inter', sans-serif; }
        .cs-image img { transition: transform 6s ease; }
        .cs-image:hover img { transform: scale(1.04); }
        .cs-section { display: flex; min-height: 460px; }
        .cs-section-rev { display: flex; min-height: 460px; flex-direction: row-reverse; }
        .cs-text { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 72px 64px; }
        .cs-image { flex: 1; overflow: hidden; min-height: 460px; }
        .cs-nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 48px; background: #fff; border-bottom: 1px solid #f0ede8; }
        .cs-footer { text-align: center; padding: 96px 48px; background: #111; color: #fff; }
        @media (max-width: 768px) {
          .cs-nav { padding: 16px 20px; }
          .cs-nav img { height: 40px !important; }
          .cs-section { flex-direction: column; min-height: auto; }
          .cs-section-rev { flex-direction: column; min-height: auto; }
          .cs-text { padding: 40px 24px; }
          .cs-image { min-height: 240px; }
          .cs-footer { padding: 64px 24px; }
        }
      `}</style>

      <div className="cs-body-font" style={{ background: "#fafaf8", color: "#1a1a1a", overflowX: "hidden" }}>

        {/* Nav */}
        <nav className="cs-nav">
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="envago" style={{ height: 56, width: "auto", display: "block" }} />
          </a>
          <span style={{ fontSize: 12, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", color: "#999" }}>Em breve</span>
        </nav>

        {/* Row 1: text left · image right */}
        <section className="cs-section">
          <div className="cs-text" style={{ background: "#fff" }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", color: "#FF2924", marginBottom: 20 }}>Em breve</p>
            <h2 className="cs-font" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.15, color: "#111", marginBottom: 24 }}>
              Reserve passeios<br />incríveis no<br /><em style={{ fontStyle: "italic", color: "#FF2924" }}>Brasil inteiro.</em>
            </h2>
            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.75, color: "#555", maxWidth: 440 }}>
              Buggys nas dunas, mergulho, trilhas, barcos ao pôr do sol —
              encontre e reserve os melhores passeios do país, diretamente com os operadores locais.
            </p>
          </div>
          <div className="cs-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&q=85&auto=format&fit=crop"
              alt="Passeio de aventura"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </section>

        <div style={{ height: 1, background: "#f0ede8" }} />

        {/* Row 2: image left · text right */}
        <section className="cs-section-rev">
          <div className="cs-text" style={{ background: "#fafaf8" }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", color: "#FF2924", marginBottom: 20 }}>Lançando em Jericoacoara</p>
            <h2 className="cs-font" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.15, color: "#111", marginBottom: 24 }}>
              Os melhores destinos<br />do litoral brasileiro,<br /><em style={{ fontStyle: "italic", color: "#FF2924" }}>ao alcance de um clique.</em>
            </h2>
            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.75, color: "#555", maxWidth: 440 }}>
              Sem comissão para o operador nas vendas diretas. Sem taxa de cadastro.
              Você só paga quando vende. Nós cuidamos do resto.
            </p>
          </div>
          <div className="cs-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=85&auto=format&fit=crop"
              alt="Destino Jericoacoara"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </section>

        {/* Closing */}
        <footer className="cs-footer">
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", color: "#FF2924", marginBottom: 24 }}>Aguarde</p>
          <p className="cs-font" style={{ fontSize: "clamp(48px, 8vw, 96px)", lineHeight: 1, letterSpacing: -1 }}>
            Até<span style={{ color: "#FF2924" }}> breve!</span>
          </p>
          <p style={{ marginTop: 32, fontSize: 14, fontWeight: 300, letterSpacing: 1, color: "#888" }}>
            envago.live &nbsp;·&nbsp; em desenvolvimento
          </p>
        </footer>

      </div>
    </>
  );
}
