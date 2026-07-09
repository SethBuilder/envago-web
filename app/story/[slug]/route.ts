import { buildAmpStory } from "../../lib/buildAmpStory";
import { fetchStory } from "../../lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const origin = new URL(_request.url).origin;

  try {
    const { data } = await fetchStory(slug);
    const html = buildAmpStory(data, slug, origin);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
