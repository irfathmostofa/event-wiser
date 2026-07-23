import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import EventRenderer from "../../components/event-template/EventRenderer";

export default function AdminPreview() {
  const { eventId } = useParams();
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
  if (state.status === "not_found") return <div className="screen-loading">Event not found.</div>;

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
        <span>Admin preview — {state.event.is_published ? "already live" : "not yet published"}</span>
        <Link to="/admin" style={{ color: "var(--wine-950)", fontWeight: 500 }}>
          ← back to payment review
        </Link>
      </div>
      <div style={{ paddingTop: "2.25rem" }}>
        <EventRenderer event={state.event} timeline={state.timeline} gallery={state.gallery} />
      </div>
    </>
  );
}
