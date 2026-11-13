"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Article } from "@/lib/data";
import { saveArticle } from "./actions";

const MAX_PDF_MB = 25;

const NEW_SECTION = "__new__";

export default function ArticleForm({ article, sections }: { article?: Article; sections: string[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"link" | "pdf">(article?.kind ?? "link");
  const [sectionChoice, setSectionChoice] = useState(article?.section ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      setError(null);
      let filePath = article?.file_path ?? null;
      if (kind === "pdf") {
        const file = fd.get("file") as File | null;
        if (file && file.size > 0) {
          if (file.type !== "application/pdf") return setError("Please choose a PDF file.");
          if (file.size > MAX_PDF_MB * 1024 * 1024) return setError(`PDFs must be under ${MAX_PDF_MB} MB.`);
          const path = `${crypto.randomUUID()}.pdf`;
          const { error } = await createClient()
            .storage.from("documents")
            .upload(path, file, { contentType: "application/pdf" });
          if (error) return setError(`Upload failed: ${error.message}`);
          filePath = path;
        }
        if (!filePath) return setError("Please attach a PDF.");
      }
      fd.delete("file");
      fd.set("file_path", filePath ?? "");
      if (sectionChoice === NEW_SECTION) {
        const name = String(fd.get("new_section") ?? "").trim();
        if (!name) return setError("Type a name for the new section, or pick an existing one.");
        fd.set("section", name);
      } else {
        fd.set("section", sectionChoice);
      }
      fd.delete("new_section");
      const res = await saveArticle(article?.id ?? null, fd);
      if (res.error) return setError(res.error);
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input id="title" name="title" required defaultValue={article?.title} className="field font-serif text-base" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="outlet">Outlet</label>
          <input id="outlet" name="outlet" defaultValue={article?.outlet ?? ""} placeholder="Freedom of the Press Foundation" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="published_on">Date published</label>
          <input id="published_on" name="published_on" type="date" defaultValue={article?.published_on ?? ""} className="field" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="section">Section</label>
          <select
            id="section"
            value={sectionChoice}
            onChange={(e) => setSectionChoice(e.target.value)}
            className="field"
          >
            <option value="">No section</option>
            {sections.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value={NEW_SECTION}>+ New section…</option>
          </select>
        </div>
        {sectionChoice === NEW_SECTION && (
          <div>
            <label className="label" htmlFor="new_section">New section name</label>
            <input id="new_section" name="new_section" autoFocus placeholder="e.g. Press freedom" className="field" />
          </div>
        )}
      </div>
      <div>
        <label className="label" htmlFor="summary">Short summary (optional)</label>
        <textarea id="summary" name="summary" rows={3} defaultValue={article?.summary ?? ""} className="field" />
      </div>

      <fieldset>
        <legend className="label">Type</legend>
        <div className="flex gap-6 text-sm">
          {(["link", "pdf"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2">
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
              {k === "link" ? "Link to article" : "Upload PDF"}
            </label>
          ))}
        </div>
      </fieldset>

      {kind === "link" ? (
        <div>
          <label className="label" htmlFor="url">Article URL</label>
          <input id="url" name="url" type="url" required defaultValue={article?.url ?? ""} placeholder="https://" className="field" />
        </div>
      ) : (
        <div>
          <label className="label" htmlFor="file">
            PDF {article?.file_path && "(leave empty to keep the current file)"}
          </label>
          <input id="file" name="file" type="file" accept="application/pdf" className="text-sm" />
        </div>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}
      <div className="flex gap-3">
        <button className="btn" disabled={pending}>{pending ? "Saving…" : "Save article"}</button>
        <button type="button" className="btn-ghost" onClick={() => router.push("/admin")}>Cancel</button>
      </div>
    </form>
  );
}
