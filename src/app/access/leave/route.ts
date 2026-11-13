import { NextResponse, type NextRequest } from "next/server";
import { READER_COOKIE } from "@/lib/reader";

export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.delete(READER_COOKIE);
  return res;
}
