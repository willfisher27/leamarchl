"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/access";

type Result = { error?: string };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (fd: FormData, key: string) => str(fd, key) || null;
const isHttpUrl = (v: string) => /^https?:\/\/\S+$/i.test(v);

function refresh() {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin");
}

async function requireEditor() {
  const viewer = await getViewer();
  if (!viewer.isEditor) throw new Error("Not authorized");
  return viewer.supabase;
}

export async function updateProfile(fd: FormData): Promise<Result> {
  try {
    const supabase = await requireEditor();
    const { data: current } = await supabase.from("profile").select("photo_path").eq("id", 1).single();

    const links = { linkedin_url: optional(fd, "linkedin_url"), x_url: optional(fd, "x_url"), bluesky_url: optional(fd, "bluesky_url") };
    for (const v of Object.values(links)) {
      if (v && !isHttpUrl(v)) return { error: `“${v}” isn’t a valid link (it should start with https://).` };
    }

    const photo_path = optional(fd, "photo_path");
    const { error } = await supabase
      .from("profile")
      .update({
        name: str(fd, "name") || "Lea Marchl",
        title: str(fd, "title"),
        bio: str(fd, "bio"),
        experience: str(fd, "experience"),
        short_bio: str(fd, "short_bio"),
        email: optional(fd, "email"),
        ...links,
        photo_path,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) return { error: error.message };

    if (current?.photo_path && current.photo_path !== photo_path) {
      await supabase.storage.from("site-public").remove([current.photo_path]);
    }
    refresh();
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function saveArticle(id: string | null, fd: FormData): Promise<Result> {
  try {
    const supabase = await requireEditor();
    const kind = str(fd, "kind") === "pdf" ? "pdf" : "link";
    const url = str(fd, "url");
    const file_path = optional(fd, "file_path");
    const title = str(fd, "title");

    if (!title) return { error: "Title is required." };
    if (kind === "link" && !isHttpUrl(url)) return { error: "Please enter a full link starting with https://." };
    if (kind === "pdf" && !file_path) return { error: "Please attach a PDF." };

    const row = {
      title,
      outlet: optional(fd, "outlet"),
      published_on: optional(fd, "published_on"),
      summary: optional(fd, "summary"),
      kind,
      url: kind === "link" ? url : null,
      file_path: kind === "pdf" ? file_path : null,
      visibility: str(fd, "visibility") === "private" ? "private" : "public",
    };

    if (id) {
      const { data: existing } = await supabase.from("articles").select("file_path").eq("id", id).single();
      const { error } = await supabase.from("articles").update(row).eq("id", id);
      if (error) return { error: error.message };
      if (existing?.file_path && existing.file_path !== row.file_path) {
        await supabase.storage.from("documents").remove([existing.file_path]);
      }
    } else {
      const { error } = await supabase.from("articles").insert(row);
      if (error) return { error: error.message };
    }
    refresh();
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function setPassword(fd: FormData): Promise<Result> {
  try {
    const supabase = await requireEditor();
    const password = String(fd.get("password") ?? "");
    if (password.length < 12) return { error: "Use at least 12 characters." };
    if (password !== String(fd.get("confirm") ?? "")) return { error: "The two passwords don’t match." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteArticle(id: string): Promise<Result> {
  try {
    const supabase = await requireEditor();
    const { data: existing } = await supabase.from("articles").select("file_path").eq("id", id).single();
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return { error: error.message };
    if (existing?.file_path) await supabase.storage.from("documents").remove([existing.file_path]);
    refresh();
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
