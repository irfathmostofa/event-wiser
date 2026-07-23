import imageCompression from "browser-image-compression";
import { supabase } from "./supabase";

// Compresses an image client-side, then uploads it into the event's folder
// in the `event-images` bucket. Returns the public URL.
export async function uploadEventImage(eventId, file) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const ext = "jpg";
  const path = `${eventId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, compressed, { contentType: "image/jpeg" });

  if (error) throw error;

  const { data } = supabase.storage.from("event-images").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
