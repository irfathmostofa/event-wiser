import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getImageUsage } from "../../lib/imageUsage";
import DetailsTab from "./tabs/DetailsTab";
import TimelineTab from "./tabs/TimelineTab";
import GalleryTab from "./tabs/GalleryTab";
import PreviewTab from "./tabs/PreviewTab";
import PublishTab from "./tabs/PublishTab";

const TABS = [
  { key: "details", label: "Details" },
  { key: "timeline", label: "Timeline" },
  { key: "gallery", label: "Gallery" },
  { key: "preview", label: "Preview" },
  { key: "publish", label: "Publish" },
];

export default function EventEditor() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("details");
  const [usage, setUsage] = useState({ used: 0, limit: 20, remaining: 20 });

  async function loadEvent() {
    const { data } = await supabase.from("events").select("*").eq("id", eventId).single();
    setEvent(data);
    setLoading(false);
  }

  async function refreshImageCount() {
    setUsage(await getImageUsage(eventId));
  }

  useEffect(() => {
    loadEvent();
    refreshImageCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (loading) return <p style={{ color: "var(--blush)" }}>Loading…</p>;
  if (!event) return <p style={{ color: "var(--blush)" }}>Event not found.</p>;

  return (
    <div>
      <Link to="/dashboard" className="text-sm" style={{ color: "var(--gold-dim)" }}>
        ← All events
      </Link>
      <div className="flex items-center justify-between mt-2 mb-2">
        <h1 className="font-display text-2xl" style={{ color: "var(--gold-soft)" }}>
          {event.recipient_name}
        </h1>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: event.is_published ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
            color: event.is_published ? "#86efac" : "#fcd34d",
          }}
        >
          {event.is_published ? "Live" : "Draft — not published"}
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--gold-dim)" }}>
        {usage.remaining} image upload{usage.remaining === 1 ? "" : "s"} available ({usage.used} of{" "}
        {usage.limit} used — deleting an image doesn't return the slot)
      </p>

      <div className="flex gap-1 border-b mb-6" style={{ borderColor: "var(--gold-dim)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
            style={{
              borderColor: tab === t.key ? "var(--gold)" : "transparent",
              color: tab === t.key ? "var(--gold-soft)" : "var(--gold-dim)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "details" && <DetailsTab event={event} onUpdate={setEvent} />}
      {tab === "timeline" && <TimelineTab event={event} onImageCountChange={refreshImageCount} />}
      {tab === "gallery" && <GalleryTab event={event} onImageCountChange={refreshImageCount} />}
      {tab === "preview" && <PreviewTab event={event} />}
      {tab === "publish" && <PublishTab event={event} usedImages={usage.used} />}
    </div>
  );
}
