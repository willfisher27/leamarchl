import { NextResponse } from "next/server";
import { getViewer } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stable link for a PDF. Checks access, then redirects to a 5-minute signed URL.
 * Private PDFs return 404 (not 403) to visitors without access, so their existence isn't revealed.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => new NextResponse("Not found", { status: 404 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return notFound();

  const { isReader } = await getViewer();
  const admin = createAdminClient();
  const { data: article } = await admin
    .from("articles")
    .select("kind, file_path, visibility")
    .eq("id", id)
    .maybeSingle();

  if (!article || article.kind !== "pdf" || !article.file_path) return notFound();
  if (article.visibility === "private" && !isReader) return notFound();

  const { data, error } = await admin.storage
    .from("documents")
    .createSignedUrl(article.file_path, 300);
  if (error || !data) return notFound();

  const res = NextResponse.redirect(data.signedUrl);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
