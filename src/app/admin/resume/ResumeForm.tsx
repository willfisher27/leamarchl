"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { setResume } from "../actions";

const MAX_MB = 25;

export default function ResumeForm({ hasResume }: { hasResume: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return setMessage({ ok: false, text: "Choose a PDF first." });
    if (file.type !== "application/pdf") return setMessage({ ok: false, text: "The resume must be a PDF." });
    if (file.size > MAX_MB * 1024 * 1024) return setMessage({ ok: false, text: `PDF must be under ${MAX_MB} MB.` });

    start(async () => {
      setMessage(null);
      const path = `resume/${crypto.randomUUID()}.pdf`;
      const { error } = await createClient().storage.from("documents").upload(path, file, { contentType: "application/pdf" });
      if (error) return setMessage({ ok: false, text: `Upload failed: ${error.message}` });
      const res = await setResume(path);
      if (res.error) return setMessage({ ok: false, text: res.error });
      if (fileRef.current) fileRef.current.value = "";
      setMessage({ ok: true, text: "Resume updated." });
    });
  }

  function remove() {
    if (!confirm("Remove the resume from the site?")) return;
    start(async () => {
      const res = await setResume(null);
      setMessage(res.error ? { ok: false, text: res.error } : { ok: true, text: "Resume removed." });
    });
  }

  return (
    <div className="space-y-5 rounded-md border border-rule bg-surface p-5">
      {hasResume ? (
        <p className="text-sm">
          A resume is uploaded.{" "}
          <a href="/resume/pdf" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
            View current PDF
          </a>
        </p>
      ) : (
        <p className="text-sm text-muted">No resume uploaded yet.</p>
      )}
      <div>
        <label className="label" htmlFor="resume">{hasResume ? "Replace with a new PDF" : "Choose PDF"}</label>
        <input ref={fileRef} id="resume" type="file" accept="application/pdf" className="text-sm" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn" disabled={pending} onClick={upload}>
          {pending ? "Working…" : "Upload"}
        </button>
        {hasResume && (
          <button type="button" className="btn-ghost hover:border-accent hover:text-accent" disabled={pending} onClick={remove}>
            Remove resume
          </button>
        )}
        {message && <span className={`text-sm ${message.ok ? "text-muted" : "text-accent"}`}>{message.text}</span>}
      </div>
    </div>
  );
}
