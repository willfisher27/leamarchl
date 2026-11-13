import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Daily Vercel cron (see vercel.json) so the free Supabase project never pauses for inactivity. */
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { error } = await createAdminClient().from("profile").select("id").limit(1);
  return NextResponse.json({ ok: !error });
}
