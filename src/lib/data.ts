import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * The whole site is behind a login. Every page checks the visitor first
 * (requireViewer / requireEditorPage in lib/access.ts), then reads data here
 * with the secret key. The public key can't read anything.
 */

export type Profile = {
  id: number;
  name: string;
  title: string;
  bio: string;
  experience: string;
  short_bio: string;
  photo_path: string | null;
  resume_path: string | null;
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
  /** Legacy column: "link" when there's a URL, else "pdf". An article may have a URL, a PDF, or both. */
  kind: "link" | "pdf";
  url: string | null;
  file_path: string | null;
  section: string | null;
  created_at: string;
};

export type Photo = {
  id: string;
  file_path: string;
  caption: string | null;
  width: number | null;
  height: number | null;
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
  resume_path: null,
  email: null,
  linkedin_url: null,
  x_url: null,
  bluesky_url: null,
};

export async function getProfile(): Promise<Profile> {
  const { data } = await createAdminClient().from("profile").select("*").eq("id", 1).maybeSingle();
  return { ...FALLBACK_PROFILE, ...((data as Partial<Profile> | null) ?? {}) };
}

export async function getArticles(): Promise<Article[]> {
  const { data } = await createAdminClient()
    .from("articles")
    .select("*")
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return (data as Article[] | null) ?? [];
}

/** Distinct section names, A→Z. */
export function sectionNames(articles: Article[]) {
  return [...new Set(articles.map((a) => a.section).filter((s): s is string => Boolean(s)))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

export type SectionGroup = { name: string | null; slug: string; articles: Article[] };

/**
 * Articles grouped by section: named sections A→Z, then unsectioned ones ("Other") last.
 * Within each section, articles keep their newest-first order.
 */
export function groupBySection(articles: Article[]): SectionGroup[] {
  const groups: SectionGroup[] = sectionNames(articles).map((name) => ({
    name,
    slug: sectionSlug(name),
    articles: articles.filter((a) => a.section === name),
  }));
  const rest = articles.filter((a) => !a.section);
  if (rest.length) groups.push({ name: null, slug: "other", articles: rest });
  return groups;
}

export function sectionSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
}

export async function getPhotos(): Promise<Photo[]> {
  const { data } = await createAdminClient()
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Photo[] | null) ?? [];
}

/** Images live in a private bucket; /media checks the login, then redirects to a signed link. */
export function mediaUrl(path: string) {
  return `/media/${path}`;
}

export function pdfHref(a: Article) {
  return a.file_path ? `/files/${a.id}` : null;
}

/** Main link for an article: the published URL if there is one, otherwise the PDF. */
export function articleHref(a: Article) {
  return a.url ?? pdfHref(a) ?? "#";
}

export function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
