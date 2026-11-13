import { requireEditorPage } from "@/lib/access";
import { getProfile } from "@/lib/data";
import ProfileForm from "../ProfileForm";

export default async function AdminProfilePage() {
  await requireEditorPage();
  const profile = await getProfile();
  return (
    <section>
      <h1 className="mb-6 font-serif text-3xl">Profile</h1>
      <ProfileForm profile={profile} />
    </section>
  );
}
