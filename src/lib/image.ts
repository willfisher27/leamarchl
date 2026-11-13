/**
 * Browser-side: shrink an image before upload so the gallery loads fast and
 * stays well inside Supabase's free 1 GB storage. Output is JPEG.
 */
export async function resizeImage(file: File, maxSide = 2400, quality = 0.86) {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`Couldn’t read “${file.name}”. Use a JPG, PNG, or WebP image.`);
  });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn’t process the image.");
  ctx.fillStyle = "#ffffff"; // flatten transparent PNGs onto white
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Image conversion failed."))), "image/jpeg", quality),
  );
  return { blob, width, height };
}
