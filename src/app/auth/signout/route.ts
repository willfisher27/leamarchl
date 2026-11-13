import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { READER_COOKIE } from "@/lib/reader";

/** Signs out both kinds of session (viewer cookie and editor login). */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.delete(READER_COOKIE);
  return res;
}
