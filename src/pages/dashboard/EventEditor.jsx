import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import DetailsTab from "./tabs/DetailsTab";
import TimelineTab from "./tabs/TimelineTab";
import GalleryTab from "./tabs/GalleryTab";
import PublishTab from "./tabs/PublishTab";

const TABS = [
  { key: "details", label: "Details" },
  { key: "timeline", label: "Timeline" },
  { key: "gallery", label: "Gallery" },
  { key: "publish", label: "Publish" },
];

export default function EventEditor() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("details");
  const [usedImages, setUsedImages] = useState(0);

  async function loadEvent() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Error loading event:", error);
    } else {
      setEvent(data);
    }
    setLoading(false);
  }

  async function refreshImageCount() {
    try {
      const [{ count: tCount }, { count: gCount }] = await Promise.all([
        supabase
          .from("timeline_items")
          .select("id", { count: "exact", head: true })
          .eq("event_id", eventId)
          .not("image_path", "is", null),
        supabase
          .from("gallery_images")
          .select("id", { count: "exact", head: true })
          .eq("event_id", eventId),
      ]);
      setUsedImages((tCount ?? 0) + (gCount ?? 0));
    } catch (error) {
      console.error("Error refreshing image count:", error);
    }
  }

  // Handle event update from child components
  function handleEventUpdate(updatedEvent) {
    setEvent(updatedEvent);
    // Also refresh image count in case images were updated
    refreshImageCount();
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
      <Link
        to="/dashboard"
        className="text-sm"
        style={{ color: "var(--gold-dim)" }}
      >
        ← All events
      </Link>
      <div className="flex items-center justify-between mt-2 mb-2">
        <h1
          className="font-display text-2xl"
          style={{ color: "var(--gold-soft)" }}
        >
          {event.recipient_name}
        </h1>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: event.is_published
              ? "rgba(34,197,94,0.15)"
              : "rgba(245,158,11,0.15)",
            color: event.is_published ? "#86efac" : "#fcd34d",
          }}
        >
          {event.is_published ? "Live" : "Draft — not published"}
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--gold-dim)" }}>
        {usedImages} / 20 free images used across timeline + gallery
      </p>

      <div
        className="flex gap-1 border-b mb-6"
        style={{ borderColor: "var(--gold-dim)" }}
      >
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

      {tab === "details" && (
        <DetailsTab event={event} onUpdate={handleEventUpdate} />
      )}
      {tab === "timeline" && (
        <TimelineTab event={event} onImageCountChange={refreshImageCount} />
      )}
      {tab === "gallery" && (
        <GalleryTab event={event} onImageCountChange={refreshImageCount} />
      )}
      {tab === "publish" && (
        <PublishTab
          event={event}
          usedImages={usedImages}
          onUpdate={handleEventUpdate}
        />
      )}
    </div>
  );
}
