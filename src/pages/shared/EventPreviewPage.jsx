import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import EventRenderer from "../../components/event-template/EventRenderer";

export default function EventPreviewPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", event: null, timeline: [], gallery: [] });

  useEffect(() => {
    async function load() {
      const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (!event) {
        setState({ status: "not_found", event: null, timeline: [], gallery: [] });
        return;
      }
      const [{ data: timeline }, { data: gallery }] = await Promise.all([
        supabase.from("timeline_items").select("*").eq("event_id", event.id).order("sort_order"),
        supabase.from("gallery_images").select("*").eq("event_id", event.id).order("sort_order"),
      ]);
      setState({ status: "ready", event, timeline: timeline ?? [], gallery: gallery ?? [] });
    }
    load();
  }, [eventId]);

  if (state.status === "loading") return <div className="screen-loading">Loading…</div>;
  if (state.status === "not_found")
    return <div className="screen-loading">Can't preview this — it may not exist, or you don't have access.</div>;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--gold)",
          color: "var(--wine-950)",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Preview — {state.event.is_published ? "already live" : "draft, not published yet"}</span>
        <button onClick={() => navigate(-1)} style={{ color: "var(--wine-950)", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>
          ← back
        </button>
      </div>
      <div style={{ paddingTop: "2.25rem" }}>
        <EventRenderer event={state.event} timeline={state.timeline} gallery={state.gallery} />
      </div>
    </>
  );
}
