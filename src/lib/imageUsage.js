import { supabase } from "./supabase";

// Total image slots = 20 free + any verified extra_images payments (50tk each).
// Usage is counted across timeline_items (with a photo) AND gallery_images combined.
export async function getImageUsage(eventId) {
  const [{ count: timelineCount }, { count: galleryCount }, { data: extras }] = await Promise.all([
    supabase
      .from("timeline_items")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .not("image_path", "is", null),
    supabase
      .from("gallery_images")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId),
    supabase
      .from("payments")
      .select("quantity")
      .eq("event_id", eventId)
      .eq("type", "extra_images")
      .eq("status", "verified"),
  ]);

  const extraSlots = (extras ?? []).reduce((sum, p) => sum + p.quantity, 0);
  const used = (timelineCount ?? 0) + (galleryCount ?? 0);
  const limit = 20 + extraSlots;
  return { used, limit };
}
