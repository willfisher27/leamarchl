import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/access";
import NavLinks from "@/components/NavLinks";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isEditor } = await getViewer();
  if (!user) redirect("/login?as=editor");
  if (!isEditor) {
    return (
      <p className="text-sm text-muted">
        You’re signed in as {user.email}, but that email isn’t on the editors list.
      </p>
    );
  }
  return (
    <div>
      <NavLinks
        className="mb-10 rounded-lg border border-rule bg-surface/60 px-4 py-3"
        links={[
          { href: "/admin", label: "Articles" },
          { href: "/admin/photos", label: "Photography" },
          { href: "/admin/resume", label: "Resume" },
          { href: "/admin/profile", label: "Profile" },
          { href: "/admin/account", label: "Account" },
        ]}
      />
      {children}
    </div>
  );
}
