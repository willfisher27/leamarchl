import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { READER_COOKIE, verifyReaderToken } from "@/lib/reader";

/** Who is looking at the page: an editor, a viewer with the shared password, or nobody yet. */
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

  const hasViewerPass = await verifyReaderToken((await cookies()).get(READER_COOKIE)?.value);

  return {
    supabase,
    user,
    isEditor,
    /** Signed in as a viewer or an editor, so can see the site. */
    isSignedIn: isEditor || hasViewerPass,
  };
}

/** Use at the top of every page: sends anyone not signed in to the login screen. */
export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) redirect("/login");
  return viewer;
}

export async function requireEditorPage() {
  const viewer = await getViewer();
  if (!viewer.isEditor) redirect("/login?as=editor");
  return viewer;
}
