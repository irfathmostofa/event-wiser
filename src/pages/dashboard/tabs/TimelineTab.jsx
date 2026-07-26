import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { uploadEventImage } from "../../../lib/uploadImage";
import { getImageUsage } from "../../../lib/imageUsage";
import { getPublicImageUrl } from "../../../lib/storage";

export default function TimelineTab({ event, onImageCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  async function load() {
    const { data } = await supabase
      .from("timeline_items")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order");
    setItems((data ?? []).map((it) => ({ ...it, image_url: getPublicImageUrl(it.image_path) })));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  async function addItem() {
    const { data } = await supabase
      .from("timeline_items")
      .insert({ event_id: event.id, sort_order: items.length })
      .select()
      .single();
    if (data) setItems((cur) => [...cur, data]);
  }

  async function updateItem(id, patch) {
    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    await supabase.from("timeline_items").update(patch).eq("id", id);
  }

  async function removeItem(id) {
    await supabase.from("timeline_items").delete().eq("id", id);
    setItems((cur) => cur.filter((it) => it.id !== id));
    onImageCountChange?.();
  }

  async function handleImage(id, file) {
    const { used, limit } = await getImageUsage(event.id);
    if (used >= limit) {
      alert(`You've used all ${limit} image slots for this event. Buy more slots on the Publish tab.`);
      return;
    }
    setUploadingId(id);
    try {
      const { url, path } = await uploadEventImage(event.id, file);
      await updateItem(id, { image_path: path });
      setItems((cur) => cur.map((it) => (it.id === id ? { ...it, image_url: url } : it)));
      onImageCountChange?.();
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
    setUploadingId(null);
  }

  if (loading) return <p style={{ color: "var(--blush)" }}>Loading…</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-xl p-4 flex gap-4"
          style={{ background: "var(--wine-900)", borderColor: "var(--gold-dim)" }}
        >
          <label
            className="shrink-0 w-20 h-20 rounded-lg flex items-center justify-center text-xs cursor-pointer overflow-hidden"
            style={{ background: "var(--wine-800)", color: "var(--gold-dim)" }}
          >
            {item.image_url || item.image_path ? (
              <img src={item.image_url ?? item.image_path} alt="" className="w-full h-full object-cover" />
            ) : uploadingId === item.id ? (
              "…"
            ) : (
              "+ Photo"
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleImage(item.id, e.target.files[0])}
            />
          </label>
          <div className="flex-1 space-y-2">
            <input
              placeholder="Date label, e.g. Jan 2024"
              defaultValue={item.date_label ?? ""}
              onBlur={(e) => updateItem(item.id, { date_label: e.target.value })}
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
          <button
            onClick={() => removeItem(item.id)}
            className="text-sm self-start"
            style={{ color: "var(--gold-dim)" }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="rounded-lg border border-dashed px-4 py-3 text-sm w-full"
        style={{ borderColor: "var(--gold-dim)", color: "var(--gold-dim)" }}
      >
        + Add timeline moment
      </button>
    </div>
  );
}
