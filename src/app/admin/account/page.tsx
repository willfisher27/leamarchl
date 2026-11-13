import { requireEditorPage } from "@/lib/access";
import PasswordForm from "../PasswordForm";

export default async function AdminAccountPage() {
  const { user } = await requireEditorPage();
  return (
    <section>
      <h1 className="mb-6 font-serif text-3xl">Your password</h1>
      <PasswordForm email={user?.email ?? ""} />
      <p className="mt-10 text-sm text-muted">
        The viewer password (the one you share with readers) is set in Vercel as <code>READER_PASSWORD</code>.
        Changing it there and redeploying signs out every viewer.
      </p>
    </section>
  );
}
