import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const OCCASIONS = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "fathers_day", label: "Father's Day" },
  { value: "mothers_day", label: "Mother's Day" },
  { value: "valentines_day", label: "Valentine's Day" },
  { value: "other", label: "Other" },
];

function slugify(recipientName, occasionType) {
  const base = `${recipientName}-${occasionType}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "event"}-${suffix}`;
}

const cardStyle = { background: "var(--wine-900)", borderColor: "var(--gold-dim)" };

export default function EventsList() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [occasionType, setOccasionType] = useState("birthday");

  async function loadEvents() {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const slug = slugify(recipientName, occasionType);
    const { error } = await supabase.from("events").insert({
      owner_id: user.id,
      occasion_type: occasionType,
      recipient_name: recipientName,
      slug,
    });
    if (!error) {
      setCreating(false);
      setRecipientName("");
      loadEvents();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: "var(--gold-soft)" }}>
          My events
        </h1>
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: "var(--gold)", color: "var(--wine-950)" }}
        >
          {creating ? "Cancel" : "+ New event"}
        </button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="border rounded-xl p-5 mb-6 space-y-4"
          style={cardStyle}
        >
          <div>
            <label className="text-sm block mb-1" style={{ color: "var(--blush)" }}>Occasion</label>
            <select
              value={occasionType}
              onChange={(e) => setOccasionType(e.target.value)}
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              style={{ borderColor: "var(--gold-dim)", color: "var(--ivory)" }}
            >
              {OCCASIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ color: "black" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1" style={{ color: "var(--blush)" }}>Recipient's name</label>
            <input
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Anika"
              className="w-full rounded-lg border bg-transparent px-3 py-2 placeholder:text-[var(--gold-dim)]"
              style={{ borderColor: "var(--gold-dim)", color: "var(--ivory)" }}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: "var(--gold)", color: "var(--wine-950)" }}
          >
            Create event
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--blush)" }}>Loading…</p>
      ) : events.length === 0 ? (
        <p style={{ color: "var(--blush)" }}>No events yet. Create your first one above.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/dashboard/events/${ev.id}`}
              className="block border rounded-xl p-4 transition-colors hover:opacity-90"
              style={cardStyle}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wide" style={{ color: "var(--gold-dim)" }}>
                  {OCCASIONS.find((o) => o.value === ev.occasion_type)?.label}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: ev.is_published ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                    color: ev.is_published ? "#86efac" : "#fcd34d",
                  }}
                >
                  {ev.is_published ? "Live" : "Draft"}
                </span>
              </div>
              <h3 className="font-display text-lg" style={{ color: "var(--ivory)" }}>{ev.recipient_name}</h3>
              <p className="text-xs mt-1" style={{ color: "var(--gold-dim)" }}>/e/{ev.slug}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
