// Server-side: use full URL. Client-side: use relative URL so requests
// go through the Next.js rewrite proxy (avoids mixed-content on HTTPS).
const API_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001")
    : "";

export interface ApiReview {
  author_name: string;
  body: string;
}

export interface ApiProvider {
  id: number;
  business_name: string;
  slug: string;
  logo_url: string | null;
  is_approved: boolean;
  booking_enabled: boolean;
  claimed: boolean;
  activities: ApiActivity[];
}

export interface ApiActivity {
  id: number;
  name: string;
  slug: string;
  price: string;
  pricing_type: "per_person" | "per_unit";
  pricing_unit: string | null;
  unit_capacity: number | null;
  duration_minutes: number;
  city: string;
  state: string;
  category: { id: number; name: string; slug: string } | null;
  cover_url: string | null;
  first_video: { url: string; poster_url: string | null } | null;
  provider: { id: number; business_name: string; slug: string; logo_url: string | null; booking_enabled: boolean } | null;
  booking_method: 'envago' | 'affiliate' | 'lead';
  link_url: string | null;
  updated_at: string;
  avg_rating: number | null;
  review_count: number;
  recent_reviews: ApiReview[];
}

export interface ApiSchedule {
  id: number;
  date: string;
  time: string;
  seats_total: number;
  seats_booked: number;
  seats_left: number;
}

export interface ApiVideo {
  url: string;
  poster_url: string | null;
  instagram_handle: string | null;
}

export interface ApiActivityQuestion {
  id: number;
  label: string;
  type: 'text' | 'select';
  options: string[];
  required: boolean;
}

export interface ApiActivityDetail extends ApiActivity {
  description: string | null;
  highlights: string[];
  capacity: number;
  gallery: string[];
  videos: ApiVideo[];
  media: { type: string; url: string; poster_url: string | null; instagram_handle: string | null }[];
  meeting_point: string | null;
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  reviews: {
    author_name: string;
    author_avatar_url: string | null;
    rating: number;
    body: string;
    created_at: string;
  }[];
  schedules: ApiSchedule[];
  questions: ApiActivityQuestion[];
}

export interface ActivitiesResponse {
  data: ApiActivity[];
  meta: { current_page: number; last_page: number; total: number };
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_URL}/api/v1/categories`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export async function fetchActivities(params?: {
  category?: string;
  city?: string;
  page?: number;
}): Promise<ActivitiesResponse> {
  const base = API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const url = new URL(`${base}/api/v1/activities`);
  if (params?.category && params.category !== "todos") {
    url.searchParams.set("category", params.category);
  }
  if (params?.city) url.searchParams.set("city", params.city);
  if (params?.page && params.page > 1) url.searchParams.set("page", String(params.page));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

export async function fetchProvider(slug: string): Promise<{ data: ApiProvider }> {
  const url = `${API_URL}/api/v1/operadores/${slug}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Provider not found");
  return res.json();
}

export async function fetchActivity(slug: string, fresh = false): Promise<{ data: ApiActivityDetail }> {
  const res = await fetch(`${API_URL}/api/v1/activities/${slug}`, {
    next: fresh ? undefined : { revalidate: 60 },
    cache: fresh ? "no-store" : undefined,
  });
  if (!res.ok) throw new Error("Activity not found");
  return res.json();
}

export interface ApiArticle {
  id: number;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  destination: string | null;
  template_type: string | null;
  content: string;
  cover_image: string | null;
  published_at: string;
  story?: ApiWebStory | null;
}

export interface ApiWebStory {
  id: number;
  article_id: number;
  slides: ApiStorySlide[];
  status: string;
}

export interface ApiStorySlide {
  title: string;
  body: string;
  image_url: string;
  cta_text?: string;
  cta_url?: string;
}

export async function fetchArticles(): Promise<{ data: ApiArticle[] }> {
  const res = await fetch(`${API_URL}/api/v1/articles`, { next: { revalidate: 300 } });
  if (!res.ok) return { data: [] };
  return res.json();
}

export async function fetchArticle(slug: string): Promise<{ data: ApiArticle }> {
  const res = await fetch(`${API_URL}/api/v1/articles/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("Article not found");
  return res.json();
}

export interface ApiStoryListItem {
  article_slug: string;
  article_title: string;
  article_destination: string | null;
  poster_image: string;
  slide_count: number;
  published_at: string;
}

export interface ApiStoryDetail {
  slides: ApiStorySlide[];
  poster_image: string;
  published_at: string;
  article: {
    slug: string;
    title: string;
    destination: string | null;
    published: boolean;
  };
}

export async function fetchStories(): Promise<{ data: ApiStoryListItem[] }> {
  const res = await fetch(`${API_URL}/api/v1/stories`, { cache: "no-store" });
  if (!res.ok) return { data: [] };
  return res.json();
}

export async function fetchStory(slug: string): Promise<{ data: ApiStoryDetail }> {
  const res = await fetch(`${API_URL}/api/v1/stories/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Story not found");
  return res.json();
}
