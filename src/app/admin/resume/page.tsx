import { requireEditorPage } from "@/lib/access";
import { getProfile } from "@/lib/data";
import ResumeForm from "./ResumeForm";

export default async function AdminResumePage() {
  await requireEditorPage();
  const { resume_path } = await getProfile();
  return (
    <section>
      <h1 className="mb-2 font-serif text-3xl">Resume</h1>
      <p className="mb-6 text-sm text-muted">Upload a PDF. It appears on the Resume page with a download button.</p>
      <ResumeForm hasResume={Boolean(resume_path)} />
    </section>
  );
}
