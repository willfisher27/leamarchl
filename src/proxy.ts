import { SUPABASE_URL } from "@/lib/supabase/url";
import { READER_COOKIE, verifyReaderToken } from "@/lib/reader";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Pages anyone can reach without signing in. */
const OPEN_PATHS = [/^\/login(\/|$)/, /^\/auth\//, /^\/api\/keepalive$/];

/**
 * Runs before every request:
 * 1. keeps an editor's Supabase session fresh
 * 2. sends anyone who isn't signed in (as viewer or editor) to /login
 * Each page and file route also checks access itself, as a second line of defense.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (OPEN_PATHS.some((re) => re.test(path))) return response;

  if (user || (await verifyReaderToken(request.cookies.get(READER_COOKIE)?.value))) {
    return response;
  }

  const login = new URL("/login", request.url);
  if (path !== "/") login.searchParams.set("next", path + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
