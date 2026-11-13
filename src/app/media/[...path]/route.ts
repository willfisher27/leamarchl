import { NextResponse } from "next/server";
import { getViewer } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";

const SAFE_PATH = /^(profile|photos)\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i;

/**
 * Images (profile photo, photography) live in a private bucket.
 * Checks the login, then redirects to a 1-hour signed link. The browser may reuse
 * the redirect for 30 minutes, so the gallery doesn't re-sign on every view.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  const notFound = () => new NextResponse("Not found", { status: 404 });
  if (!SAFE_PATH.test(path)) return notFound();

  const { isSignedIn } = await getViewer();
  if (!isSignedIn) return notFound();

  const { data, error } = await createAdminClient().storage.from("site-public").createSignedUrl(path, 3600);
  if (error || !data) return notFound();

  const res = NextResponse.redirect(data.signedUrl);
  res.headers.set("Cache-Control", "private, max-age=1800");
  return res;
}
