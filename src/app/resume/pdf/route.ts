import { NextResponse, type NextRequest } from "next/server";
import { getViewer } from "@/lib/access";
import { getProfile } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

/** Checks the login, then redirects to a 5-minute signed link for the resume PDF. */
export async function GET(request: NextRequest) {
  const { isSignedIn } = await getViewer();
  if (!isSignedIn) return new NextResponse("Not found", { status: 404 });

  const { resume_path, name } = await getProfile();
  if (!resume_path) return new NextResponse("Not found", { status: 404 });

  const download = request.nextUrl.searchParams.has("download")
    ? `${name.replace(/[^\w ]+/g, "").trim().replace(/\s+/g, "-")}-Resume.pdf`
    : undefined;
  const { data, error } = await createAdminClient()
    .storage.from("documents")
    .createSignedUrl(resume_path, 300, download ? { download } : undefined);
  if (error || !data) return new NextResponse("Not found", { status: 404 });

  const res = NextResponse.redirect(data.signedUrl);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
