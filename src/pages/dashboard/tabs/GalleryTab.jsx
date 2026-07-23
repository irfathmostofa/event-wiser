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

export default function GalleryTab({ event, onImageCountChange }) {
  const [images, setImages] = useState([]);
  const [usage, setUsage] = useState({ used: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState(null);
  const [captionValue, setCaptionValue] = useState("");
  const [limitError, setLimitError] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [{ data: imgs, error: imgsError }, u] = await Promise.all([
        supabase
          .from("gallery_images")
          .select("*")
          .eq("event_id", event.id)
          .order("sort_order"),
        getImageUsage(event.id),
      ]);

      if (imgsError) {
        console.error("Error loading gallery images:", imgsError);
        setImages([]);
      } else {
        // Add image_url to each item
        const imagesWithUrls = (imgs ?? []).map((img) => ({
          ...img,
          image_url: img.image_path ? getPublicUrl(img.image_path) : null,
        }));
        setImages(imagesWithUrls);
      }

      setUsage(u);
      setLoading(false);
    } catch (err) {
      console.error("Load error:", err);
      setError("Failed to load gallery images");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  async function handleUpload(files) {
    setError("");
    setLimitError(false);
    setUploading(true);

    const filesArray = Array.from(files);
    let uploadCount = 0;

    for (const file of filesArray) {
      // Check limit before each upload
      const current = await getImageUsage(event.id);
      if (current.used >= current.limit) {
        setLimitError(true);
        setUsage(current);
        break;
      }

      try {
        // Upload the image to storage
        const { url, path } = await uploadEventImage(event.id, file);

        // Insert into database
        const { data, error } = await supabase
          .from("gallery_images")
          .insert({
            event_id: event.id,
            image_path: path,
            sort_order: images.length + uploadCount,
            caption: "", // Empty caption by default
          })
          .select()
          .single();

        if (error) {
          console.error("Database insert error:", error);
          setError("Failed to save image: " + error.message);
          break;
        }

        // Add to local state with image_url
        setImages((cur) => [...cur, { ...data, image_url: url }]);
        uploadCount++;

        // Notify parent about image count change
        onImageCountChange?.();
      } catch (err) {
        console.error("Upload error:", err);
        setError("Upload failed: " + err.message);
        break;
      }
    }

    // Update final usage
    const finalUsage = await getImageUsage(event.id);
    setUsage(finalUsage);
    setUploading(false);
  }

  async function updateCaption(id, caption) {
    // Update caption even if published (text updates are allowed)
    setImages((cur) =>
      cur.map((img) => (img.id === id ? { ...img, caption } : img)),
    );

    const { error } = await supabase
      .from("gallery_images")
      .update({ caption })
      .eq("id", id);

    if (error) {
      console.error("Error updating caption:", error);
      setError("Failed to update caption");
      setTimeout(() => setError(""), 3000);
      await load();
    }
  }

  // Start editing caption
  function startEditing(id, currentCaption) {
    setEditingCaption(id);
    setCaptionValue(currentCaption || "");
  }

  // Save caption
  function saveCaption(id) {
    if (editingCaption === id) {
      updateCaption(id, captionValue);
      setEditingCaption(null);
      setCaptionValue("");
    }
  }

  // Cancel editing
  function cancelEditing() {
    setEditingCaption(null);
    setCaptionValue("");
  }

  async function removeImage(id) {
    if (!confirm("Remove this image from the gallery?")) return;

    try {
      // Find the image to get its path
      const image = images.find((img) => img.id === id);

      if (image?.image_path) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from("event-images")
          .remove([image.image_path]);

        if (storageError) {
          console.error("Error deleting from storage:", storageError);
          // Continue with database deletion even if storage fails
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Database delete error:", error);
        setError("Failed to remove image: " + error.message);
        return;
      }

      // Update local state
      setImages((cur) => cur.filter((img) => img.id !== id));

      // Update usage
      const u = await getImageUsage(event.id);
      setUsage(u);
      onImageCountChange?.();
    } catch (err) {
      console.error("Remove error:", err);
      setError("Failed to remove image: " + err.message);
    }
  }

  // Handle image loading errors
  function handleImageError(e, image) {
    if (image.image_path) {
      const newUrl = getPublicUrl(image.image_path);
      if (newUrl && newUrl !== e.target.src) {
        e.target.src = newUrl;
        // Update local state with correct URL
        setImages((cur) =>
          cur.map((img) =>
            img.id === image.id ? { ...img, image_url: newUrl } : img,
          ),
        );
      }
    }
  }

  // Reorder images - always allowed
  async function reorderImages(startIndex, endIndex) {
    const newImages = Array.from(images);
    const [removed] = newImages.splice(startIndex, 1);
    newImages.splice(endIndex, 0, removed);

    const updates = newImages.map((img, index) => ({
      id: img.id,
      sort_order: index,
    }));

    setImages(newImages);

    try {
      await Promise.all(
        updates.map(({ id, sort_order }) =>
          supabase.from("gallery_images").update({ sort_order }).eq("id", id),
        ),
      );
    } catch (err) {
      console.error("Reorder error:", err);
      await load();
    }
  }

  if (loading) return <p style={{ color: "var(--blush)" }}>Loading…</p>;

  const remainingSlots = usage.limit - usage.used;

  return (
    <div className="max-w-2xl">
      {/* Image usage info */}
      <div className="flex justify-between items-center mb-4">
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
          📸 {usage.used} / {usage.limit} images used (timeline + gallery
          combined)
          {remainingSlots > 0 &&
            ` — ${remainingSlots} slot${remainingSlots > 1 ? "s" : ""} available`}
          {remainingSlots === 0 && " — No slots remaining"}
        </div>
        {uploading && (
          <span
            className="text-sm flex items-center gap-2 ml-3"
            style={{ color: "var(--gold-soft)" }}
          >
            <div
              className="animate-spin inline-block w-4 h-4 border-2 rounded-full"
              style={{
                borderColor: "var(--gold)",
                borderTopColor: "transparent",
              }}
            />
            Uploading...
          </span>
        )}
      </div>

      {error && (
        <div
          className="text-sm p-3 rounded-lg border mb-4"
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

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="relative rounded-lg overflow-hidden group"
            style={{ background: "var(--wine-800)" }}
          >
            {/* Image container */}
            <div className="aspect-square">
              {img.image_url ? (
                <img
                  src={img.image_url}
                  alt={img.caption || "Gallery image"}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, img)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xs"
                  style={{ color: "var(--gold-dim)" }}
                >
                  No image
                </div>
              )}
            </div>

            {/* Caption - always editable */}
            <div className="p-1.5" style={{ minHeight: "32px" }}>
              {editingCaption === img.id ? (
                <input
                  type="text"
                  value={captionValue}
                  placeholder="Add caption..."
                  className="w-full rounded-lg border px-2 py-1 text-xs bg-transparent outline-none"
                  style={{
                    borderColor: "var(--gold)",
                    color: "var(--ivory)",
                  }}
                  onChange={(e) => setCaptionValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveCaption(img.id);
                    }
                    if (e.key === "Escape") {
                      cancelEditing();
                    }
                  }}
                  onBlur={() => saveCaption(img.id)}
                  autoFocus
                />
              ) : (
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => startEditing(img.id, img.caption)}
                >
                  {img.caption ? (
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--blush)" }}
                    >
                      {img.caption}
                    </p>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--gold-dim)" }}>
                      Click to add caption
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Image actions overlay - always show remove button */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => removeImage(img.id)}
                className="text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"
                style={{ background: "rgba(255,0,0,0.7)" }}
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Upload button - hidden when no slots available */}
        {remainingSlots > 0 && (
          <label
            className={`aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center text-xs cursor-pointer hover:opacity-80 transition-opacity ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
            style={{ borderColor: "var(--gold-dim)", color: "var(--gold-dim)" }}
          >
            {uploading ? (
              <>
                <div
                  className="animate-spin w-5 h-5 border-2 rounded-full mb-1"
                  style={{
                    borderColor: "var(--gold)",
                    borderTopColor: "transparent",
                  }}
                />
                Uploading...
              </>
            ) : (
              <>
                <span className="text-2xl">+</span>
                <span>Add Images</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files.length) {
                  handleUpload(Array.from(e.target.files));
                  e.target.value = ""; // Reset input
                }
              }}
            />
          </label>
        )}
      </div>

      {(limitError || usage.used >= usage.limit) && (
        <div
          className="rounded-lg p-4 text-sm"
          style={{
            background: "rgba(245,158,11,0.12)",
            color: "var(--gold-soft)",
            border: "1px solid var(--gold-dim)",
          }}
        >
          <p>
            You've used all {usage.limit} image slots for this event (timeline +
            gallery combined).
          </p>
          <p className="mt-1">
            Head to the{" "}
            <span className="font-medium" style={{ color: "var(--gold)" }}>
              Publish
            </span>{" "}
            tab to buy more — ৳50 per extra image.
          </p>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="text-center py-8" style={{ color: "var(--gold-dim)" }}>
          <p className="text-sm">
            No images yet.{" "}
            {remainingSlots > 0 && 'Click the "Add Images" button to upload.'}
          </p>
          {remainingSlots === 0 && (
            <p className="text-xs mt-1">
              You've used all your image slots. Buy more on the Publish tab.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
