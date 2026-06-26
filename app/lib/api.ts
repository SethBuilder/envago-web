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
  booking_enabled: boolean;
  activities: ApiActivity[];
}

export interface ApiActivity {
  id: number;
  name: string;
  slug: string;
  price: string;
  duration_minutes: number;
  city: string;
  state: string;
  category: { id: number; name: string; slug: string } | null;
  cover_url: string | null;
  provider: { id: number; business_name: string; slug: string; logo_url: string | null; booking_enabled: boolean } | null;
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

export interface ApiActivityDetail extends ApiActivity {
  description: string | null;
  capacity: number;
  gallery: string[];
  reviews: {
    author_name: string;
    author_avatar_url: string | null;
    rating: number;
    body: string;
    created_at: string;
  }[];
  schedules: ApiSchedule[];
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
  const url = new URL(`${API_URL}/api/v1/activities`);
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
  const res = await fetch(`${API_URL}/api/v1/operadores/${slug}`, { next: { revalidate: 60 } });
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
