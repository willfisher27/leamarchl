import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { READER_COOKIE, verifyReaderToken } from "@/lib/reader";

/** Who is looking at the page: an editor, a reader with the password, or the public. */
export async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEditor = false;
  if (user) {
    const { data } = await supabase.rpc("is_editor");
    isEditor = data === true;
  }

  const token = (await cookies()).get(READER_COOKIE)?.value;
  const hasReaderPass = await verifyReaderToken(token);

  return {
    supabase,
    user,
    isEditor,
    /** Can see private materials. */
    isReader: isEditor || hasReaderPass,
  };
}
