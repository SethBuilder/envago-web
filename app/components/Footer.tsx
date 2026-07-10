"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#111", color: "#fff", marginTop: "auto" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          textAlign: "center",
        }}
      >
        {/* Logo + tagline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <img src="/logo.svg" alt="Envago" style={{ height: 28, width: "auto" }} />
          <p style={{ fontSize: 13, color: "#666", margin: 0, letterSpacing: "0.02em" }}>
            Passeios e aventuras no Brasil
          </p>
        </div>

        {/* Social icons */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/envagobrasil"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram @envagobrasil"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "transform 0.15s, opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="white" strokeWidth="1.8"/>
              <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/envago.io/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Envago"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#1877F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:envagobrasil@gmail.com"
            aria-label="E-mail envagobrasil@gmail.com"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, #ff2924 0%, #ff7a00 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="white" strokeWidth="1.8"/>
              <path d="M2 7l10 7 10-7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "#222" }} />

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            fontSize: 12,
            color: "#555",
          }}
        >
          <Link
            href="/privacidade"
            style={{ color: "#555", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555")}
          >
            Política de Privacidade
          </Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} Envago. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
