import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Secret-key (service role) client. Bypasses row-level security — only use on the server,
 * and only after checking the visitor is allowed to see what you fetch.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
