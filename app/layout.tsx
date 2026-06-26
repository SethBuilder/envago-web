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
