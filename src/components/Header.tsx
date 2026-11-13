import Link from "next/link";
import { getViewer } from "@/lib/access";
import NavLinks from "./NavLinks";

export default async function Header() {
  const { isSignedIn, isEditor } = await getViewer();
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b border-rule py-6">
      <Link href="/" className="font-serif text-2xl tracking-tight">
        Lea Marchl
      </Link>
      {isSignedIn && (
        <NavLinks
          links={[
            { href: "/", label: "About" },
            { href: "/articles", label: "Work" },
            { href: "/resume", label: "Resume" },
            { href: "/photography", label: "Photography" },
            ...(isEditor ? [{ href: "/admin", label: "Admin", accent: true }] : []),
          ]}
        />
      )}
    </header>
  );
}
