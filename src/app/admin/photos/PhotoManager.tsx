"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/image";
import type { Photo } from "@/lib/data";
import { addPhotos, deletePhoto, updatePhotoCaption } from "../actions";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoManager({ photos }: { photos: Photo[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  function upload() {
    const files = Array.from(fileRef.current?.files ?? []);
    if (files.length === 0) return setStatus({ ok: false, text: "Choose one or more photos first." });
    const bad = files.find((f) => !ACCEPTED.includes(f.type));
    if (bad) return setStatus({ ok: false, text: `“${bad.name}” isn’t a JPG, PNG, or WebP image.` });

    start(async () => {
      const supabase = createClient();
      const uploaded: { file_path: string; width: number; height: number }[] = [];
      try {
        for (const [i, file] of files.entries()) {
          setStatus({ ok: true, text: `Uploading ${i + 1} of ${files.length}…` });
          const { blob, width, height } = await resizeImage(file);
          const path = `photos/${crypto.randomUUID()}.jpg`;
          const { error } = await supabase.storage.from("site-public").upload(path, blob, { contentType: "image/jpeg" });
          if (error) throw new Error(`“${file.name}”: ${error.message}`);
          uploaded.push({ file_path: path, width, height });
        }
      } catch (e) {
        if (uploaded.length) await supabase.storage.from("site-public").remove(uploaded.map((u) => u.file_path));
        return setStatus({ ok: false, text: `Upload failed. ${(e as Error).message}` });
      }
      const res = await addPhotos(uploaded);
      if (res.error) return setStatus({ ok: false, text: res.error });
      if (fileRef.current) fileRef.current.value = "";
      setStatus({ ok: true, text: `Added ${uploaded.length} photo${uploaded.length === 1 ? "" : "s"}.` });
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-md border border-rule bg-surface p-5">
        <div>
          <label className="label" htmlFor="photos">Add photos</label>
          <input ref={fileRef} id="photos" type="file" multiple accept={ACCEPTED.join(",")} className="text-sm" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn" disabled={pending} onClick={upload}>
            {pending ? "Uploading…" : "Upload"}
          </button>
          {status && <span className={`text-sm ${status.ok ? "text-muted" : "text-accent"}`}>{status.text}</span>}
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-muted">No photos yet.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <PhotoCard key={p.id} photo={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PhotoCard({ photo }: { photo: Photo }) {
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const dirty = caption.trim() !== (photo.caption ?? "");

  return (
    <li className="overflow-hidden rounded-md border border-rule bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/media/${photo.file_path}`} alt={photo.caption ?? ""} className="aspect-[4/3] w-full bg-rule object-cover" loading="lazy" />
      <div className="space-y-2 p-3">
        <textarea
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
            setNote(null);
          }}
          rows={2}
          placeholder="Caption (optional)"
          className="field"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-xs"
            disabled={!dirty || pending}
            onClick={() =>
              start(async () => {
                const res = await updatePhotoCaption(photo.id, caption);
                setNote(res.error ?? "Saved");
              })
            }
          >
            Save caption
          </button>
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-xs hover:border-accent hover:text-accent"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this photo? This can’t be undone.")) return;
              start(async () => {
                const res = await deletePhoto(photo.id);
                if (res.error) setNote(res.error);
              });
            }}
          >
            Delete
          </button>
          {note && <span className="text-xs text-muted">{note}</span>}
        </div>
      </div>
    </li>
  );
}
