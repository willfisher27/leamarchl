import type { Metadata } from "next";
import { requireViewer } from "@/lib/access";
import { getProfile } from "@/lib/data";

export const metadata: Metadata = { title: "Resume" };

export default async function ResumePage() {
  await requireViewer();
  const profile = await getProfile();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight">Resume</h1>
        {profile.resume_path && (
          <div className="flex gap-2">
            <a href="/resume/pdf" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Open in new tab
            </a>
            <a href="/resume/pdf?download=1" className="btn">
              Download PDF
            </a>
          </div>
        )}
      </div>

      {profile.resume_path ? (
        <iframe
          src="/resume/pdf"
          title={`${profile.name} resume`}
          className="mt-8 h-[85vh] w-full rounded-md border border-rule bg-surface"
        />
      ) : (
        <p className="mt-8 text-muted">The resume hasn’t been added yet.</p>
      )}
    </div>
  );
}
