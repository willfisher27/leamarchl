import { requireEditorPage } from "@/lib/access";
import { getPhotos } from "@/lib/data";
import PhotoManager from "./PhotoManager";

export default async function AdminPhotosPage() {
  await requireEditorPage();
  const photos = await getPhotos();
  return (
    <section>
      <h1 className="mb-2 font-serif text-3xl">Photography</h1>
      <p className="mb-6 text-sm text-muted">
        Upload JPG, PNG, or WebP images (you can select several at once). They’re resized for the web before upload.
        Newest appear first.
      </p>
      <PhotoManager photos={photos} />
    </section>
  );
}
