import type { Metadata } from "next";
import { requireViewer } from "@/lib/access";
import { getPhotos, mediaUrl } from "@/lib/data";

export const metadata: Metadata = { title: "Photography" };

export default async function PhotographyPage() {
  await requireViewer();
  const photos = await getPhotos();

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Photography</h1>
      {photos.length === 0 ? (
        <p className="mt-8 text-muted">No photos yet.</p>
      ) : (
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {photos.map((p) => (
            <figure key={p.id} className="mb-5 break-inside-avoid">
              <a href={mediaUrl(p.file_path)} target="_blank" rel="noopener noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(p.file_path)}
                  alt={p.caption ?? "Photograph by Lea Marchl"}
                  width={p.width ?? undefined}
                  height={p.height ?? undefined}
                  loading="lazy"
                  className="h-auto w-full rounded-sm bg-rule transition hover:opacity-90"
                />
              </a>
              {p.caption && <figcaption className="mt-2 text-sm leading-relaxed text-muted">{p.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
