import { supabase } from "./supabase";

// Converts a storage-relative path (e.g. "eventId/uuid.jpg") into a full public URL.
export function getPublicImageUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from("event-images").getPublicUrl(path);
  return data.publicUrl;
}
