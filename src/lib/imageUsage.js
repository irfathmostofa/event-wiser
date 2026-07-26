import { supabase } from "./supabase";

// Usage is a PERMANENT counter (events.images_uploaded_count) — deleting an image
// never frees up the slot. 20 uploads are covered by the ৳500 publish fee; anything
// beyond that needs a verified extra_images payment (৳50 each) to raise the limit.
export async function getImageUsage(eventId) {
  const [{ data: event }, { data: extras }] = await Promise.all([
    supabase.from("events").select("images_uploaded_count").eq("id", eventId).single(),
    supabase
      .from("payments")
      .select("quantity")
      .eq("event_id", eventId)
      .eq("type", "extra_images")
      .eq("status", "verified"),
  ]);

  const extraSlots = (extras ?? []).reduce((sum, p) => sum + p.quantity, 0);
  const used = event?.images_uploaded_count ?? 0;
  const limit = 20 + extraSlots;
  return { used, limit, remaining: Math.max(0, limit - used) };
}
