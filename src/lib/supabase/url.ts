/**
 * The Supabase project URL, cleaned up so a value pasted with a trailing slash
 * or the "/rest/v1/" API path (easy to copy by mistake) still works.
 */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/rest\/v1$/, "");
