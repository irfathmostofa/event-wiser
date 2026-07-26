import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { uploadEventImage } from "../../../lib/uploadImage";
import { getImageUsage } from "../../../lib/imageUsage";
import { getPublicImageUrl } from "../../../lib/storage";

export default function GalleryTab({ event, onImageCountChange }) {
  const [images, setImages] = useState([]);
  const [usage, setUsage] = useState({ used: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [limitError, setLimitError] = useState(false);

  async function load() {
    const [{ data: imgs }, u] = await Promise.all([
      supabase.from("gallery_images").select("*").eq("event_id", event.id).order("sort_order"),
      getImageUsage(event.id),
    ]);
    setImages((imgs ?? []).map((im) => ({ ...im, image_url: getPublicImageUrl(im.image_path) })));
    setUsage(u);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  async function handleUpload(files) {
    setLimitError(false);
    setUploading(true);
    for (const file of files) {
      const current = await getImageUsage(event.id);
      if (current.used >= current.limit) {
        setLimitError(true);
        setUsage(current);
        break;
      }
      try {
        const { url, path } = await uploadEventImage(event.id, file);
        const { data, error } = await supabase
          .from("gallery_images")
          .insert({ event_id: event.id, image_path: path, sort_order: images.length })
          .select()
          .single();
        if (error) {
          setLimitError(true);
          break;
        }
        setImages((cur) => [...cur, { ...data, image_url: url }]);
        onImageCountChange?.();
      } catch (err) {
        alert("Upload failed: " + err.message);
        break;
      }
    }
    const finalUsage = await getImageUsage(event.id);
    setUsage(finalUsage);
    setUploading(false);
  }

  async function removeImage(id) {
    await supabase.from("gallery_images").delete().eq("id", id);
    setImages((cur) => cur.filter((im) => im.id !== id));
    const u = await getImageUsage(event.id);
    setUsage(u);
    onImageCountChange?.();
  }

  if (loading) return <p style={{ color: "var(--blush)" }}>Loading…</p>;

  return (
    <div className="max-w-2xl">
      <p className="text-sm mb-4" style={{ color: "var(--gold-dim)" }}>
        {usage.remaining} image upload{usage.remaining === 1 ? "" : "s"} available ({usage.used} of{" "}
        {usage.limit} used across timeline + gallery — deleting an image doesn't return the slot)
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-lg overflow-hidden group"
            style={{ background: "var(--wine-800)" }}
          >
            <img src={img.image_url ?? img.image_path} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        {usage.used < usage.limit && (
          <label
            className="aspect-square rounded-lg border border-dashed flex items-center justify-center text-xs cursor-pointer"
            style={{ borderColor: "var(--gold-dim)", color: "var(--gold-dim)" }}
          >
            {uploading ? "…" : "+ Add"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files.length && handleUpload(Array.from(e.target.files))}
            />
          </label>
        )}
      </div>

      {(limitError || usage.used >= usage.limit) && (
        <div
          className="rounded-lg p-4 text-sm"
          style={{ background: "rgba(245,158,11,0.12)", color: "var(--gold-soft)", border: "1px solid var(--gold-dim)" }}
        >
          You've used all {usage.limit} image slots for this event (timeline + gallery combined). Head to
          the <span className="font-medium">Publish</span> tab to buy more — ৳50 per extra image.
        </div>
      )}
    </div>
  );
}
