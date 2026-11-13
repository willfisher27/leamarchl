import { createBrowserClient } from "@supabase/ssr";

/** Browser client — used by editors to upload files directly to storage. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
