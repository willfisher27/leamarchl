import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUPABASE_URL } from "@/lib/supabase/url";

export type Profile = {
  id: number;
  name: string;
  title: string;
  bio: string;
  experience: string;
  short_bio: string;
  photo_path: string | null;
  email: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  bluesky_url: string | null;
};

export type Article = {
  id: string;
  title: string;
  outlet: string | null;
  published_on: string | null;
  summary: string | null;
  kind: "link" | "pdf";
  url: string | null;
  file_path: string | null;
  visibility: "public" | "private";
  created_at: string;
};

export const FALLBACK_PROFILE: Profile = {
  id: 1,
  name: "Lea Marchl",
  title: "Reporter, Freedom of the Press Foundation",
  bio: "",
  experience: "",
  short_bio: "",
  photo_path: null,
  email: null,
  linkedin_url: null,
  x_url: null,
  bluesky_url: null,
};

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const { data } = await supabase.from("profile").select("*").eq("id", 1).maybeSingle();
  return (data as Profile | null) ?? FALLBACK_PROFILE;
}

/**
 * Public visitors: queried as themselves, so row-level security only returns public rows.
 * Readers/editors: queried with the service role, after the caller has verified access.
 */
export async function getArticles(includePrivate: boolean): Promise<Article[]> {
  const client = includePrivate ? createAdminClient() : await createClient();
  let query = client
    .from("articles")
    .select("*")
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (!includePrivate) query = query.eq("visibility", "public");
  const { data } = await query;
  return (data as Article[] | null) ?? [];
}

export function publicFileUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/site-public/${path}`;
}

export function articleHref(a: Article) {
  return a.kind === "pdf" ? `/files/${a.id}` : (a.url ?? "#");
}

export function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
