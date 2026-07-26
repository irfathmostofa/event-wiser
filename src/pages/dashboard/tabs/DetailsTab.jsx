import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { getDemoContent, DEMO_CONTENT } from "../../../lib/demoContent";

const OCCASIONS = Object.entries(DEMO_CONTENT).map(([value, c]) => ({ value, label: c.label }));

const inputStyle = { borderColor: "var(--gold-dim)", color: "var(--ivory)", background: "transparent" };
const inputClass = "w-full rounded-lg border px-3 py-2 outline-none placeholder:text-[var(--gold-dim)]";
const labelClass = "text-sm block mb-1";

export default function DetailsTab({ event, onUpdate }) {
  const [form, setForm] = useState({
    occasion_type: event.occasion_type ?? "other",
    recipient_name: event.recipient_name ?? "",
    target_date: event.target_date ? event.target_date.slice(0, 16) : "",
    message: event.message ?? "",
    signature: event.signature ?? "",
    closing_line: event.closing_line ?? "",
    locked_message:
      event.locked_message ??
      "something is waiting for you here — Some memories and a letter, sealed until your day arrives.",
    locked_footer: event.locked_footer ?? "come back on the day to open it",
    countdown_eyebrow: event.countdown_eyebrow ?? "",
    countdown_arrived: event.countdown_arrived ?? "",
    section_eyebrow: event.section_eyebrow ?? "",
    envelope_letter_mark: event.envelope_letter_mark ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const demo = getDemoContent(form.occasion_type);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function fillExample() {
    const d = getDemoContent(form.occasion_type);
    setForm((f) => ({
      ...f,
      message: f.message || d.message,
      signature: f.signature || d.signature,
      closing_line: f.closing_line || d.closing_line,
      countdown_eyebrow: f.countdown_eyebrow || d.countdown_eyebrow,
      countdown_arrived: f.countdown_arrived || d.countdown_arrived,
      section_eyebrow: f.section_eyebrow || d.section_eyebrow,
      envelope_letter_mark: f.envelope_letter_mark || d.envelope_letter_mark,
    }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase
      .from("events")
      .update({
        occasion_type: form.occasion_type,
        recipient_name: form.recipient_name,
        target_date: form.target_date ? new Date(form.target_date).toISOString() : null,
        message: form.message,
        signature: form.signature,
        closing_line: form.closing_line,
        locked_message: form.locked_message,
        locked_footer: form.locked_footer,
        countdown_eyebrow: form.countdown_eyebrow,
        countdown_arrived: form.countdown_arrived,
        section_eyebrow: form.section_eyebrow,
        envelope_letter_mark: form.envelope_letter_mark,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id)
      .select()
      .single();
    setSaving(false);
    if (!error) {
      onUpdate(data);
      setSaved(true);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: "var(--blush)" }}>Occasion</label>
          <select
            className={inputClass}
            style={inputStyle}
            value={form.occasion_type}
            onChange={(e) => set("occasion_type", e.target.value)}
          >
            {OCCASIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ color: "black" }}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--blush)" }}>Recipient's name</label>
          <input className={inputClass} style={inputStyle} value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--blush)" }}>
          Reveal date &amp; time <span style={{ color: "var(--gold-dim)" }}>(page unlocks at this moment)</span>
        </label>
        <input type="datetime-local" className={inputClass} style={inputStyle} value={form.target_date} onChange={(e) => set("target_date", e.target.value)} />
      </div>

      <div className="border rounded-lg p-4" style={{ borderColor: "var(--gold-dim)", background: "rgba(201,162,75,0.06)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium" style={{ color: "var(--gold-soft)" }}>
            Not sure what to write?
          </p>
          <button
            type="button"
            onClick={() => setShowExample((v) => !v)}
            className="text-xs underline"
            style={{ color: "var(--gold-soft)" }}
          >
            {showExample ? "Hide example" : `See example for ${demo.label}`}
          </button>
        </div>
        {showExample && (
          <p className="text-sm mb-3" style={{ color: "var(--blush)" }}>
            "{demo.message}"
          </p>
        )}
        <button
          type="button"
          onClick={fillExample}
          className="text-xs rounded-lg px-3 py-1.5 font-medium"
          style={{ background: "var(--gold-dim)", color: "var(--wine-950)" }}
        >
          Fill in example wording (only into fields you haven't written yet)
        </button>
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--blush)" }}>Message / letter</label>
        <textarea rows={6} className={inputClass} style={inputStyle} value={form.message} onChange={(e) => set("message", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: "var(--blush)" }}>Signature</label>
          <input className={inputClass} style={inputStyle} value={form.signature} onChange={(e) => set("signature", e.target.value)} />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--blush)" }}>Closing line</label>
          <input className={inputClass} style={inputStyle} value={form.closing_line} onChange={(e) => set("closing_line", e.target.value)} />
        </div>
      </div>

      <div className="border-t pt-4" style={{ borderColor: "var(--gold-dim)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--gold-soft)" }}>Locked-screen text (shown before the reveal date)</p>
        <div className="space-y-3">
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>Waiting message</label>
            <textarea rows={2} className={inputClass} style={inputStyle} value={form.locked_message} onChange={(e) => set("locked_message", e.target.value)} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>Footer line</label>
            <input className={inputClass} style={inputStyle} value={form.locked_footer} onChange={(e) => set("locked_footer", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="border-t pt-4" style={{ borderColor: "var(--gold-dim)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--gold-soft)" }}>Reveal-day text</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: "var(--blush)" }}>Countdown eyebrow</label>
              <input className={inputClass} style={inputStyle} value={form.countdown_eyebrow} onChange={(e) => set("countdown_eyebrow", e.target.value)} placeholder={demo.countdown_eyebrow} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--blush)" }}>Big headline</label>
              <input className={inputClass} style={inputStyle} value={form.countdown_arrived} onChange={(e) => set("countdown_arrived", e.target.value)} placeholder={demo.countdown_arrived} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>Timeline section title</label>
            <input className={inputClass} style={inputStyle} value={form.section_eyebrow} onChange={(e) => set("section_eyebrow", e.target.value)} placeholder={demo.section_eyebrow} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Envelope quote <span style={{ color: "var(--gold-dim)" }}>(the line that peeks out when the envelope opens)</span>
            </label>
            <input className={inputClass} style={inputStyle} value={form.envelope_letter_mark} onChange={(e) => set("envelope_letter_mark", e.target.value)} placeholder={demo.envelope_letter_mark} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--gold)", color: "var(--wine-950)" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm" style={{ color: "#86efac" }}>Saved</span>}
      </div>
    </form>
  );
}
