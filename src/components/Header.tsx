import Link from "next/link";
import { getViewer } from "@/lib/access";

export default async function Header() {
  const { isEditor } = await getViewer();
  return (
    <header className="flex items-baseline justify-between border-b border-rule py-6">
      <Link href="/" className="font-serif text-2xl tracking-tight">
        Lea Marchl
      </Link>
      <nav className="flex gap-6 text-sm">
        <Link href="/" className="hover:text-accent">
          About
        </Link>
        <Link href="/articles" className="hover:text-accent">
          Work
        </Link>
        {isEditor && (
          <Link href="/admin" className="text-accent hover:underline">
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
