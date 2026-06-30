import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://envago.live"),
  title: "Envago | Passeios e Aventuras no Brasil",
  description:
    "Reserve os melhores passeios de buggy, kitesurf, barco e trilhas no Brasil. Pague online, confirme na hora.",
  keywords:
    "passeios Jericoacoara, buggy nas dunas, kitesurf Jeri, passeios Brasil, tours aventura",
  openGraph: {
    title: "Envago | Passeios e Aventuras no Brasil",
    description:
      "Descubra e reserve passeios incríveis em Jericoacoara e em todo o Brasil.",
    type: "website",
    locale: "pt_BR",
    siteName: "Envago",
    url: "https://envago.live",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Envago" }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-touch-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-touch-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://envago.live" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${raleway.variable} font-sans antialiased bg-[#F7F5F2] text-[#111111]`}
      >
        {children}
      </body>
    </html>
  );
}
