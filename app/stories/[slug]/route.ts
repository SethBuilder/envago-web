import { NextRequest, NextResponse } from "next/server";
import { fetchArticle, ApiStorySlide } from "../../lib/api";

export const dynamic = "force-dynamic";

function buildSlideHtml(slide: ApiStorySlide, index: number): string {
  const cta = slide.cta_url
    ? `<a href="${slide.cta_url}" target="_blank" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#ff2924;color:#fff;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;">${slide.cta_text ?? "Reservar agora"}</a>`
    : "";

  const bg = slide.image_url
    ? `<amp-story-grid-layer template="fill"><amp-img src="${slide.image_url}" width="720" height="1280" layout="fill" object-fit="cover"></amp-img></amp-story-grid-layer>`
    : `<amp-story-grid-layer template="fill" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);"></amp-story-grid-layer>`;

  return `
  <amp-story-page id="page-${index}">
    ${bg}
    <amp-story-grid-layer template="vertical" style="background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 60%);padding:32px 24px 48px;">
      <h2 style="font-size:26px;font-weight:800;color:#fff;line-height:1.2;margin:0 0 10px;">${slide.title}</h2>
      <p style="font-size:16px;color:rgba(255,255,255,.9);line-height:1.5;margin:0;">${slide.body}</p>
      ${cta}
    </amp-story-grid-layer>
  </amp-story-page>`;
}

// Stories temporarily disabled — re-enable by removing the early return below
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await params;
  return new NextResponse("Not found", { status: 404 });

  const { slug } = await params; // eslint-disable-line no-unreachable

  let article;
  try {
    const { data } = await fetchArticle(slug);
    article = data;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!article.story?.slides?.length) {
    return new NextResponse("No story", { status: 404 });
  }

  const slides = article.story!.slides.map((s: ApiStorySlide, i: number) => buildSlideHtml(s, i)).join("\n");
  const coverImage = article.cover_image ?? article.story.slides[0]?.image_url ?? "";

  const html = `<!doctype html>
<html amp lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>${article.title} | Envago</title>
  <link rel="canonical" href="https://envago.live/guias/${slug}">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": article.title,
    "url": `https://envago.live/stories/${slug}`,
    "isPartOf": { "@type": "WebSite", "name": "Envago", "url": "https://envago.live" },
    "publisher": { "@type": "Organization", "name": "Envago" },
  })}</script>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
</head>
<body>
  <amp-story standalone
    title="${article.title}"
    publisher="Envago"
    publisher-logo-src="https://envago.live/favicon-96x96.png"
    poster-portrait-src="${coverImage}">
    ${slides}
    <amp-story-page id="page-end">
      <amp-story-grid-layer template="fill" style="background:#111;">
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical" style="padding:48px 32px;align-items:center;text-align:center;">
        <p style="font-size:13px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Envago</p>
        <h2 style="font-size:24px;font-weight:800;color:#fff;margin:0 0 24px;line-height:1.3;">Quer viver essa aventura?</h2>
        <a href="https://envago.live/guias/${slug}" style="display:inline-block;padding:14px 28px;background:#ff2924;color:#fff;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:16px;">Ler artigo completo</a>
        <br>
        <a href="https://envago.live" style="display:inline-block;padding:14px 28px;border:2px solid rgba(255,255,255,.4);color:#fff;border-radius:50px;font-weight:600;font-size:14px;text-decoration:none;">Ver todos os passeios</a>
      </amp-story-grid-layer>
    </amp-story-page>
  </amp-story>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
