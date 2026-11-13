import { SUPABASE_URL } from "@/lib/supabase/url";
import { createBrowserClient } from "@supabase/ssr";

/** Browser client — used by editors to upload files directly to storage. */
export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
