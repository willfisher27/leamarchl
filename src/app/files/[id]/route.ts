import { NextResponse } from "next/server";
import { getViewer } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";

/** Stable link for an article PDF. Checks the login, then redirects to a 5-minute signed link. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => new NextResponse("Not found", { status: 404 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return notFound();

  const { isSignedIn } = await getViewer();
  if (!isSignedIn) return notFound();

  const admin = createAdminClient();
  const { data: article } = await admin.from("articles").select("file_path").eq("id", id).maybeSingle();
  if (!article?.file_path) return notFound();

  const { data, error } = await admin.storage.from("documents").createSignedUrl(article.file_path, 300);
  if (error || !data) return notFound();

  const res = NextResponse.redirect(data.signedUrl);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
