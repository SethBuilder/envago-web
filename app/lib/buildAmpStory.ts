import type { ApiStoryDetail } from "./api";

const PROD_ORIGIN = "https://envago.live";
const LOGO_URL = `${PROD_ORIGIN}/favicon-96x96.png`;

const AMP_BOILERPLATE =
  "body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}";

const AMP_BOILERPLATE_NOSCRIPT =
  "body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}";

function esc(str: string | null | undefined): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAmpStory(data: ApiStoryDetail, slug: string, siteOrigin: string = PROD_ORIGIN): string {
  const { slides, poster_image, published_at, article } = data;
  const storyUrl = `${siteOrigin}/story/${slug}`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: [poster_image],
    datePublished: published_at,
    author: { "@type": "Organization", name: "Envago" },
    publisher: {
      "@type": "Organization",
      name: "Envago",
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": storyUrl },
  });

  const bookendBg = poster_image ?? slides[0]?.image_url ?? null;

  const bookendComponents: object[] = [];
  if (article.published) {
    bookendComponents.push({
      type: "cta-link",
      links: [
        {
          text: "Ler artigo completo →",
          url: `${siteOrigin}/guias/${article.slug}`,
        },
      ],
    });
  }
  if (bookendBg) {
    bookendComponents.push({
      type: "portrait",
      title: "Envago — Passeios no Brasil",
      category: "Reserve seu passeio",
      url: siteOrigin,
      image: bookendBg,
    });
  }

  const bookendJson = JSON.stringify({
    bookendVersion: "v1.0",
    shareProviders: [
      "twitter",
      "facebook",
      { provider: "whatsapp" },
    ],
    components: bookendComponents,
  });

  const slidesHtml = slides
    .map((slide, i) => {
      const imgSrc = slide.image_url || poster_image;
      const hasCta = slide.cta_text && slide.cta_url;

      return `
    <amp-story-page id="s${i + 1}" auto-advance-after="7s">
      <amp-story-grid-layer template="fill">
        <amp-img src="${esc(imgSrc)}" width="720" height="1280" layout="fill" alt="${esc(slide.title)}"></amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="fill">
        <div class="overlay"></div>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical" class="txt">
        ${article.destination ? `<p class="dest">${esc(article.destination)}</p>` : ""}
        <h1 class="ttl">${esc(slide.title)}</h1>
        <p class="bod">${esc(slide.body)}</p>
      </amp-story-grid-layer>
      ${
        hasCta
          ? `<amp-story-cta-layer>
        <a href="${esc(slide.cta_url!)}" class="cta">${esc(slide.cta_text!)}</a>
      </amp-story-cta-layer>`
          : ""
      }
    </amp-story-page>`;
    })
    .join("\n");

  return `<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>${esc(article.title)}</title>
  <link rel="canonical" href="${storyUrl}">
  <link rel="icon" href="${LOGO_URL}" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@600;700&display=swap" rel="stylesheet">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <style amp-boilerplate>${AMP_BOILERPLATE}</style>
  <noscript><style amp-boilerplate>${AMP_BOILERPLATE_NOSCRIPT}</style></noscript>
  <style amp-custom>
    amp-story{font-family:'Raleway',sans-serif}
    .overlay{width:100%;height:100%;background:linear-gradient(to bottom,rgba(0,0,0,.55) 0%,transparent 58%),linear-gradient(to top,rgba(0,0,0,.78) 0%,transparent 38%)}
    .txt{padding:0 24px 32px;justify-content:flex-end}
    .dest{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#ff2924;margin:0 0 8px}
    .ttl{font-size:28px;font-weight:700;color:#fff;line-height:1.2;margin:0 0 12px;text-shadow:0 2px 8px rgba(0,0,0,.4)}
    .bod{font-size:15px;font-weight:600;color:rgba(255,255,255,.88);line-height:1.5;margin:0;text-shadow:0 1px 4px rgba(0,0,0,.4)}
    .cta{display:inline-block;background:#ff2924;color:#fff;font-family:'Raleway',sans-serif;font-size:14px;font-weight:700;padding:12px 24px;border-radius:50px;text-decoration:none}
  </style>
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <amp-story
    standalone
    title="${esc(article.title)}"
    publisher="Envago"
    publisher-logo-src="${LOGO_URL}"
    poster-portrait-src="${esc(poster_image)}"
  >
    ${slidesHtml}
    <amp-story-bookend layout="nodisplay">
      <script type="application/json">${bookendJson}</script>
    </amp-story-bookend>
  </amp-story>
</body>
</html>`;
}
