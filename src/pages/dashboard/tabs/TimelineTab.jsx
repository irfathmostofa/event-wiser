import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { uploadEventImage } from "../../../lib/uploadImage";
import { getImageUsage } from "../../../lib/imageUsage";

// Helper function to get public URL from path
function getPublicUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from("event-images").getPublicUrl(path);
  return data?.publicUrl || null;
}

export default function TimelineTab({ event, onImageCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [error, setError] = useState("");
  const [imageLimit, setImageLimit] = useState({ used: 0, limit: 20 });

  async function load() {
    const { data, error } = await supabase
      .from("timeline_items")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order");

    if (error) {
      console.error("Error loading timeline items:", error);
      setItems([]);
    } else {
      // Add image_url to each item
      const itemsWithUrls = (data ?? []).map((item) => ({
        ...item,
        image_url: item.image_path ? getPublicUrl(item.image_path) : null,
      }));
      setItems(itemsWithUrls);
    }

    // Get current image usage
    const usage = await getImageUsage(event.id);
    setImageLimit(usage);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  // Refresh image count
  async function refreshImageCount() {
    const usage = await getImageUsage(event.id);
    setImageLimit(usage);
    onImageCountChange?.();
  }

  async function addItem() {
    const { data, error } = await supabase
      .from("timeline_items")
      .insert({ event_id: event.id, sort_order: items.length })
      .select()
      .single();

    if (error) {
      console.error("Error adding item:", error);
      setError("Failed to add timeline item");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (data) {
      setItems((cur) => [...cur, { ...data, image_url: null }]);
    }
  }

  async function updateItem(id, patch) {
    // Allow updates to existing items always
    setItems((cur) =>
      cur.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );

    const { error } = await supabase
      .from("timeline_items")
      .update(patch)
      .eq("id", id);

    if (error) {
      console.error("Error updating item:", error);
      await load();
      setError("Failed to update item");
      setTimeout(() => setError(""), 3000);
    }
  }

  async function removeItem(id) {
    if (!confirm("Remove this timeline item?")) return;

    // Check if the item has an image that needs to be deleted
    const item = items.find((it) => it.id === id);

    if (item?.image_path) {
      // Delete from storage
      try {
        const { error } = await supabase.storage
          .from("event-images")
          .remove([item.image_path]);

        if (error) {
          console.error("Error deleting image from storage:", error);
        }
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }

    const { error } = await supabase
      .from("timeline_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove timeline item");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setItems((cur) => cur.filter((it) => it.id !== id));
    await refreshImageCount();
  }

  async function handleImage(id, file) {
    // Check if we have available image slots
    const { used, limit } = await getImageUsage(event.id);

    // Check if user has available slots
    if (used >= limit) {
      setError(
        `You've used all ${limit} image slots for this event. Buy more slots on the Publish tab.`,
      );
      setTimeout(() => setError(""), 5000);
      return;
    }

    setUploadingId(id);

    try {
      // Upload the image to storage
      const { url, path } = await uploadEventImage(event.id, file);

      // Update the item with the image path
      await updateItem(id, { image_path: path });

      // Update local state with the image URL
      setItems((cur) =>
        cur.map((it) =>
          it.id === id ? { ...it, image_path: path, image_url: url } : it,
        ),
      );

      // Refresh image count
      await refreshImageCount();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setUploadingId(null);
    }
  }

  async function removeImage(id) {
    if (!confirm("Remove this image?")) return;

    try {
      const item = items.find((it) => it.id === id);
      if (item?.image_path) {
        // Delete from storage
        const { error } = await supabase.storage
          .from("event-images")
          .remove([item.image_path]);

        if (error) {
          console.error("Error deleting image from storage:", error);
        }
      }

      // Update the item to remove image
      await updateItem(id, { image_path: null });

      // Update local state
      setItems((cur) =>
        cur.map((it) =>
          it.id === id ? { ...it, image_path: null, image_url: null } : it,
        ),
      );

      // Refresh image count
      await refreshImageCount();
    } catch (err) {
      console.error("Error removing image:", err);
      setError("Failed to remove image");
      setTimeout(() => setError(""), 3000);
    }
  }

  if (loading) return <p style={{ color: "var(--blush)" }}>Loading…</p>;

  const remainingSlots = imageLimit.limit - imageLimit.used;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Image limit info */}
      <div className="flex justify-between items-center">
        <div
          className="text-sm p-2 rounded-lg flex-1"
          style={{
            background:
              remainingSlots > 0
                ? "rgba(34,197,94,0.08)"
                : "rgba(245,158,11,0.12)",
            border:
              remainingSlots > 0
                ? "1px solid rgba(34,197,94,0.2)"
                : "1px solid var(--gold-dim)",
            color: remainingSlots > 0 ? "#86efac" : "var(--gold-soft)",
          }}
        >
          📸 {imageLimit.used} / {imageLimit.limit} images used
          {remainingSlots > 0 &&
            ` — ${remainingSlots} slot${remainingSlots > 1 ? "s" : ""} available`}
          {remainingSlots === 0 && " — No slots remaining"}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="text-sm p-3 rounded-lg border"
          style={{
            background: "rgba(243, 165, 165, 0.1)",
            borderColor: "#f3a5a5",
            color: "#f3a5a5",
          }}
        >
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-xs underline"
            style={{ color: "var(--gold-dim)" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-xl p-4 flex gap-4"
          style={{
            background: "var(--wine-900)",
            borderColor: "var(--gold-dim)",
          }}
        >
          {/* Image upload/display area */}
          <div className="relative shrink-0">
            <label
              className={`w-20 h-20 rounded-lg flex items-center justify-center text-xs overflow-hidden ${
                remainingSlots > 0 ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              style={{
                background: "var(--wine-800)",
                color: "var(--gold-dim)",
                border: item.image_url ? "none" : "1px dashed var(--gold-dim)",
                opacity: remainingSlots <= 0 && !item.image_url ? 0.5 : 1,
              }}
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.caption || "Timeline image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (item.image_path) {
                      const newUrl = getPublicUrl(item.image_path);
                      if (newUrl) {
                        e.target.src = newUrl;
                        setItems((cur) =>
                          cur.map((it) =>
                            it.id === item.id
                              ? { ...it, image_url: newUrl }
                              : it,
                          ),
                        );
                      }
                    }
                  }}
                />
              ) : uploadingId === item.id ? (
                <div className="text-center">
                  <div
                    className="animate-spin inline-block w-4 h-4 border-2 rounded-full"
                    style={{
                      borderColor: "var(--gold)",
                      borderTopColor: "transparent",
                    }}
                  />
                </div>
              ) : (
                <span>+ Photo</span>
              )}
              {/* File input - always available if slots remaining */}
              {remainingSlots > 0 && (
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files[0] && handleImage(item.id, e.target.files[0])
                  }
                  disabled={uploadingId === item.id}
                />
              )}
            </label>

            {/* Remove image button - always available if image exists */}
            {item.image_url && (
              <button
                onClick={() => removeImage(item.id)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{
                  background: "var(--wine-950)",
                  color: "var(--blush)",
                  border: "1px solid var(--gold-dim)",
                }}
                title="Remove image"
              >
                ×
              </button>
            )}
          </div>

          {/* Text inputs - always editable */}
          <div className="flex-1 space-y-2">
            <input
              placeholder="Date label, e.g. Jan 2024"
              defaultValue={item.date_label ?? ""}
              onBlur={(e) =>
                updateItem(item.id, { date_label: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-1.5 text-sm bg-transparent placeholder:text-[var(--gold-dim)]"
              style={{ borderColor: "var(--gold-dim)", color: "var(--ivory)" }}
            />
            <textarea
              placeholder="Caption"
              defaultValue={item.caption ?? ""}
              onBlur={(e) => updateItem(item.id, { caption: e.target.value })}
              rows={2}
              className="w-full rounded-lg border px-3 py-1.5 text-sm bg-transparent placeholder:text-[var(--gold-dim)]"
              style={{ borderColor: "var(--gold-dim)", color: "var(--ivory)" }}
            />
          </div>

          {/* Remove item button - always available */}
          <button
            onClick={() => removeItem(item.id)}
            className="text-sm self-start hover:opacity-80 transition-opacity"
            style={{ color: "var(--gold-dim)" }}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Add button - always available */}
      <button
        onClick={addItem}
        className="rounded-lg border border-dashed px-4 py-3 text-sm w-full hover:opacity-80 transition-opacity"
        style={{ borderColor: "var(--gold-dim)", color: "var(--gold-dim)" }}
      >
        + Add timeline moment
      </button>

      {/* Show when no items exist */}
      {items.length === 0 && (
        <div className="text-center py-8" style={{ color: "var(--gold-dim)" }}>
          <p className="text-sm">No timeline items yet.</p>
          <p className="text-xs mt-1">
            Click "Add timeline moment" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
