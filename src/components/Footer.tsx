import Link from "next/link";
import { getViewer } from "@/lib/access";

export default async function Footer() {
  const { isReader, isEditor, user } = await getViewer();
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule py-6 text-xs text-muted">
      <span>© {new Date().getFullYear()} Lea Marchl</span>
      <div className="flex gap-4">
        {isReader && !isEditor ? (
          <a href="/access/leave" className="hover:text-foreground">
            Exit private view
          </a>
        ) : !isReader ? (
          <Link href="/access" className="hover:text-foreground">
            Private access
          </Link>
        ) : null}
        {user ? (
          <form action="/auth/signout" method="post">
            <button className="hover:text-foreground">Sign out</button>
          </form>
        ) : (
          <Link href="/login" className="hover:text-foreground">
            Editor login
          </Link>
        )}
      </div>
    </footer>
  );
}
