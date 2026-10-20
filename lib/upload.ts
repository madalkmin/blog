import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_SIDE = 2400;

// Reduz fotos grandes antes do envio (mantém GIFs e arquivos pequenos como estão)
async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif" || file.size < 500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(supabase: SupabaseClient, tripId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Arquivo não é uma imagem");
  const blob = await shrink(file);
  const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const path = `${tripId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
