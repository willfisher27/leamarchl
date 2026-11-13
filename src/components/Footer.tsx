import { getViewer } from "@/lib/access";

export default async function Footer() {
  const { isSignedIn, isEditor } = await getViewer();
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule py-6 text-xs text-muted">
      <span>© {new Date().getFullYear()} Lea Marchl</span>
      {isSignedIn && (
        <form action="/auth/signout" method="post" className="flex items-center gap-3">
          <span>Signed in as {isEditor ? "editor" : "viewer"}</span>
          <button className="underline hover:text-foreground">Sign out</button>
        </form>
      )}
    </footer>
  );
}
