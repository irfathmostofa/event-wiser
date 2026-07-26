import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import EventRenderer from "../../components/event-template/EventRenderer";

export default function PublicEventPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: "loading", event: null, timeline: [], gallery: [] });

  useEffect(() => {
    async function load() {
      const { data: event } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

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
  }, [slug]);

  if (state.status === "loading") return <div className="screen-loading">Loading…</div>;
  if (state.status === "not_found")
    return (
      <div className="screen-loading" style={{ flexDirection: "column", gap: "0.5rem" }}>
        <p>This page isn't available.</p>
        <p style={{ fontSize: "0.875rem", opacity: 0.6 }}>It may still be in draft, or the link is incorrect.</p>
      </div>
    );

  return <EventRenderer event={state.event} timeline={state.timeline} gallery={state.gallery} />;
}
