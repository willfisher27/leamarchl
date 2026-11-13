import { NextResponse, type NextRequest } from "next/server";
import { checkReaderPassword, createReaderToken, READER_COOKIE, READER_MAX_AGE } from "@/lib/reader";

/** Viewer sign-in: checks the shared password and sets a signed 30-day cookie. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const nextRaw = String(form.get("next") ?? "/");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  // Small fixed delay to slow down password guessing.
  await new Promise((r) => setTimeout(r, 600));

  if (!(await checkReaderPassword(password))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("as", "viewer");
    url.searchParams.set("error", "viewer");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const res = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  res.cookies.set(READER_COOKIE, await createReaderToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: READER_MAX_AGE,
  });
  return res;
}
