import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/access";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isEditor } = await getViewer();
  if (!user) redirect("/login");
  if (!isEditor) {
    return (
      <p className="text-sm text-muted">
        You’re signed in as {user.email}, but that email isn’t on the editors list.
      </p>
    );
  }
  return children;
}
