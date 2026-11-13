"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/data";
import { resizeImage } from "@/lib/image";
import { updateProfile } from "./actions";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      setMessage(null);
      let photoPath = profile.photo_path;
      const photo = fd.get("photo") as File | null;
      if (photo && photo.size > 0) {
        if (!IMAGE_TYPES.includes(photo.type)) return setMessage({ ok: false, text: "Photo must be a JPG, PNG, or WebP." });
        let blob: Blob;
        try {
          ({ blob } = await resizeImage(photo, 1200));
        } catch (err) {
          return setMessage({ ok: false, text: (err as Error).message });
        }
        const path = `profile/${crypto.randomUUID()}.jpg`;
        const { error } = await createClient().storage.from("site-public").upload(path, blob, { contentType: "image/jpeg" });
        if (error) return setMessage({ ok: false, text: `Photo upload failed: ${error.message}` });
        photoPath = path;
      }
      fd.delete("photo");
      fd.set("photo_path", photoPath ?? "");
      const res = await updateProfile(fd);
      setMessage(res.error ? { ok: false, text: res.error } : { ok: true, text: "Saved." });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={profile.name} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={profile.title} className="field" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="photo">Profile photo {profile.photo_path && "(leave empty to keep current)"}</label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
      </div>
      <div>
        <label className="label" htmlFor="short_bio">Text below photo (optional; short bio, beat, or location)</label>
        <textarea id="short_bio" name="short_bio" rows={3} defaultValue={profile.short_bio ?? ""} className="field" />
      </div>
      <div>
        <label className="label" htmlFor="bio">Bio (leave a blank line between paragraphs)</label>
        <textarea id="bio" name="bio" rows={7} defaultValue={profile.bio} className="field font-serif text-base" />
      </div>
      <div>
        <label className="label" htmlFor="experience">Experience (one per line)</label>
        <textarea id="experience" name="experience" rows={5} defaultValue={profile.experience} className="field" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Contact email</label>
          <input id="email" name="email" type="email" defaultValue={profile.email ?? ""} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="linkedin_url">LinkedIn URL</label>
          <input id="linkedin_url" name="linkedin_url" defaultValue={profile.linkedin_url ?? ""} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="bluesky_url">Bluesky URL</label>
          <input id="bluesky_url" name="bluesky_url" defaultValue={profile.bluesky_url ?? ""} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="x_url">X URL</label>
          <input id="x_url" name="x_url" defaultValue={profile.x_url ?? ""} className="field" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="btn" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
        {message && <span className={`text-sm ${message.ok ? "text-muted" : "text-accent"}`}>{message.text}</span>}
      </div>
    </form>
  );
}
