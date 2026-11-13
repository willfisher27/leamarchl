"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; accent?: boolean };

export default function NavLinks({ links, className = "" }: { links: NavLink[]; className?: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" || href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <nav className={`flex flex-wrap gap-x-5 gap-y-2 text-sm ${className}`}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={isActive(l.href) ? "page" : undefined}
          className={`border-b pb-0.5 transition hover:text-accent ${
            isActive(l.href) ? "border-foreground" : "border-transparent"
          } ${l.accent ? "text-accent" : ""}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
