import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";

const DEFAULT_LOCKED_MESSAGE =
  "something is waiting for you here — Some memories and a letter, sealed until your day arrives.";
const DEFAULT_LOCKED_FOOTER = "come back on the day to open it";
const DEFAULT_COUNTDOWN_EYEBROW = "Finally that day has arrived";
const DEFAULT_COUNTDOWN_ARRIVED = "Happy Birthday";
const DEFAULT_SECTION_EYEBROW = "The moments worth remembering";
const DEFAULT_ENVELOPE_LETTER_MARK = "A letter for you";

// Occasion-specific defaults
const OCCASION_DEFAULTS = {
  birthday: {
    countdown_arrived: "Happy Birthday",
    countdown_eyebrow: "Finally that day has arrived",
    envelope_letter_mark: "A birthday letter for you",
  },
  anniversary: {
    countdown_arrived: "Happy Anniversary",
    countdown_eyebrow: "Finally that day has arrived",
    envelope_letter_mark: "An anniversary letter for you",
  },
  fathers_day: {
    countdown_arrived: "Happy Father's Day",
    countdown_eyebrow: "Finally that day has arrived",
    envelope_letter_mark: "A letter for Dad",
  },
  mothers_day: {
    countdown_arrived: "Happy Mother's Day",
    countdown_eyebrow: "Finally that day has arrived",
    envelope_letter_mark: "A letter for Mom",
  },
  valentines_day: {
    countdown_arrived: "Happy Valentine's Day",
    countdown_eyebrow: "Finally that day has arrived",
    envelope_letter_mark: "A love letter for you",
  },
  other: {
    countdown_arrived: "Happy Celebration",
    countdown_eyebrow: "Finally that day has arrived",
    envelope_letter_mark: "A letter for you",
  },
};

const inputStyle = {
  borderColor: "var(--gold-dim)",
  color: "var(--ivory)",
  background: "var(--wine-900)",
};
const inputClass =
  "w-full rounded-lg border px-3 py-2 outline-none placeholder:text-[var(--gold-dim)]";
const labelClass = "text-sm block mb-1";

export default function DetailsTab({ event, onUpdate }) {
  // Initialize form with event data
  const [form, setForm] = useState(() => ({
    recipient_name: event.recipient_name ?? "",
    target_date: event.target_date ? event.target_date.slice(0, 16) : "",
    message: event.message ?? "",
    signature: event.signature ?? "",
    closing_line: event.closing_line ?? "",
    locked_message: event.locked_message ?? DEFAULT_LOCKED_MESSAGE,
    locked_footer: event.locked_footer ?? DEFAULT_LOCKED_FOOTER,
    countdown_eyebrow: event.countdown_eyebrow ?? DEFAULT_COUNTDOWN_EYEBROW,
    countdown_arrived: event.countdown_arrived ?? DEFAULT_COUNTDOWN_ARRIVED,
    section_eyebrow: event.section_eyebrow ?? DEFAULT_SECTION_EYEBROW,
    envelope_letter_mark:
      event.envelope_letter_mark ?? DEFAULT_ENVELOPE_LETTER_MARK,
    occasion_type: event.occasion_type ?? "birthday",
    slug: event.slug ?? "",
  }));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Track if user manually changed values
  const [userOverrides, setUserOverrides] = useState({
    countdown_arrived: !!event.countdown_arrived,
    countdown_eyebrow: !!event.countdown_eyebrow,
    envelope_letter_mark: !!event.envelope_letter_mark,
  });

  // Store initial values to compare against
  const initialValuesRef = useRef(form);

  // Update initial values when event prop changes
  useEffect(() => {
    const newForm = {
      recipient_name: event.recipient_name ?? "",
      target_date: event.target_date ? event.target_date.slice(0, 16) : "",
      message: event.message ?? "",
      signature: event.signature ?? "",
      closing_line: event.closing_line ?? "",
      locked_message: event.locked_message ?? DEFAULT_LOCKED_MESSAGE,
      locked_footer: event.locked_footer ?? DEFAULT_LOCKED_FOOTER,
      countdown_eyebrow: event.countdown_eyebrow ?? DEFAULT_COUNTDOWN_EYEBROW,
      countdown_arrived: event.countdown_arrived ?? DEFAULT_COUNTDOWN_ARRIVED,
      section_eyebrow: event.section_eyebrow ?? DEFAULT_SECTION_EYEBROW,
      envelope_letter_mark:
        event.envelope_letter_mark ?? DEFAULT_ENVELOPE_LETTER_MARK,
      occasion_type: event.occasion_type ?? "birthday",
      slug: event.slug ?? "",
    };
    setForm(newForm);
    initialValuesRef.current = newForm;
    setIsDirty(false);
    setSaved(false);
    setError("");

    // Reset user overrides when event changes
    setUserOverrides({
      countdown_arrived: !!event.countdown_arrived,
      countdown_eyebrow: !!event.countdown_eyebrow,
      envelope_letter_mark: !!event.envelope_letter_mark,
    });
  }, [event]);

  // Auto-update fields when occasion_type changes (if user hasn't overridden)
  useEffect(() => {
    const occasionDefaults = OCCASION_DEFAULTS[form.occasion_type];
    if (!occasionDefaults) return;

    // Only auto-update if user hasn't manually overridden the value
    if (!userOverrides.countdown_arrived) {
      setForm((f) => ({
        ...f,
        countdown_arrived: occasionDefaults.countdown_arrived,
      }));
    }

    if (!userOverrides.countdown_eyebrow) {
      setForm((f) => ({
        ...f,
        countdown_eyebrow: occasionDefaults.countdown_eyebrow,
      }));
    }

    if (!userOverrides.envelope_letter_mark) {
      setForm((f) => ({
        ...f,
        envelope_letter_mark: occasionDefaults.envelope_letter_mark,
      }));
    }
  }, [form.occasion_type, userOverrides]);

  // Check if form is dirty whenever form changes
  useEffect(() => {
    const initial = initialValuesRef.current;
    const isFormDirty =
      form.recipient_name !== initial.recipient_name ||
      form.target_date !== initial.target_date ||
      form.message !== initial.message ||
      form.signature !== initial.signature ||
      form.closing_line !== initial.closing_line ||
      form.locked_message !== initial.locked_message ||
      form.locked_footer !== initial.locked_footer ||
      form.countdown_eyebrow !== initial.countdown_eyebrow ||
      form.countdown_arrived !== initial.countdown_arrived ||
      form.section_eyebrow !== initial.section_eyebrow ||
      form.envelope_letter_mark !== initial.envelope_letter_mark ||
      form.occasion_type !== initial.occasion_type ||
      form.slug !== initial.slug;

    setIsDirty(isFormDirty);

    // Clear saved status when form becomes dirty
    if (isFormDirty && saved) {
      setSaved(false);
    }
  }, [form, saved]);

  function setField(field, value) {
    // Track user overrides for auto-update fields
    if (
      field === "countdown_arrived" ||
      field === "countdown_eyebrow" ||
      field === "envelope_letter_mark"
    ) {
      setUserOverrides((prev) => ({
        ...prev,
        [field]: true,
      }));
    }

    setForm((f) => ({ ...f, [field]: value }));

    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general error when user types
    if (error) {
      setError("");
    }
  }

  function handleOccasionChange(e) {
    const newOccasion = e.target.value;

    // Update occasion type
    setForm((f) => ({ ...f, occasion_type: newOccasion }));

    // Reset user overrides for auto-update fields when occasion changes
    setUserOverrides((prev) => ({
      ...prev,
      countdown_arrived: false,
      countdown_eyebrow: false,
      envelope_letter_mark: false,
    }));

    // Clear field errors
    if (fieldErrors.occasion_type) {
      setFieldErrors((prev) => ({ ...prev, occasion_type: "" }));
    }
  }

  function validateForm() {
    const errors = {};
    let isValid = true;

    if (!form.recipient_name?.trim()) {
      errors.recipient_name = "Recipient name is required";
      isValid = false;
    }

    if (!form.target_date) {
      errors.target_date = "Reveal date is required";
      isValid = false;
    }

    if (!form.occasion_type) {
      errors.occasion_type = "Occasion type is required";
      isValid = false;
    }

    if (!form.slug?.trim()) {
      errors.slug = "Slug is required";
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    // Check if there are actual changes
    if (!isDirty) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setSaving(true);

    try {
      // Format the data for update
      const updateData = {
        recipient_name: form.recipient_name.trim(),
        target_date: form.target_date
          ? new Date(form.target_date).toISOString()
          : null,
        message: form.message || null,
        signature: form.signature || null,
        closing_line: form.closing_line || null,
        locked_message: form.locked_message,
        locked_footer: form.locked_footer,
        countdown_eyebrow: form.countdown_eyebrow,
        countdown_arrived: form.countdown_arrived,
        section_eyebrow: form.section_eyebrow,
        envelope_letter_mark: form.envelope_letter_mark,
        occasion_type: form.occasion_type,
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        updated_at: new Date().toISOString(),
      };

      console.log("Updating event with data:", updateData);

      const { data, error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", event.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        if (error.code === "23505") {
          setError(
            "This slug is already taken. Please choose a different one.",
          );
        } else {
          setError(error.message || "Failed to save changes");
        }
        setSaving(false);
        return;
      }

      console.log("Update successful:", data);

      // Update the parent component with the new data
      if (onUpdate) {
        onUpdate(data);
      }

      // Update initial values and form state
      const newForm = {
        recipient_name: data.recipient_name ?? "",
        target_date: data.target_date ? data.target_date.slice(0, 16) : "",
        message: data.message ?? "",
        signature: data.signature ?? "",
        closing_line: data.closing_line ?? "",
        locked_message: data.locked_message ?? DEFAULT_LOCKED_MESSAGE,
        locked_footer: data.locked_footer ?? DEFAULT_LOCKED_FOOTER,
        countdown_eyebrow: data.countdown_eyebrow ?? DEFAULT_COUNTDOWN_EYEBROW,
        countdown_arrived: data.countdown_arrived ?? DEFAULT_COUNTDOWN_ARRIVED,
        section_eyebrow: data.section_eyebrow ?? DEFAULT_SECTION_EYEBROW,
        envelope_letter_mark:
          data.envelope_letter_mark ?? DEFAULT_ENVELOPE_LETTER_MARK,
        occasion_type: data.occasion_type ?? "birthday",
        slug: data.slug ?? "",
      };

      setForm(newForm);
      initialValuesRef.current = newForm;
      setIsDirty(false);
      setSaved(true);

      // Clear saved status after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Occasion type options
  const occasionOptions = [
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Anniversary" },
    { value: "fathers_day", label: "Father's Day" },
    { value: "mothers_day", label: "Mother's Day" },
    { value: "valentines_day", label: "Valentine's Day" },
    { value: "other", label: "Other" },
  ];

  // Get current occasion defaults for display
  const currentOccasionDefaults =
    OCCASION_DEFAULTS[form.occasion_type] || OCCASION_DEFAULTS.birthday;

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-xl">
      {error && (
        <div
          className="text-sm p-3 rounded-lg border"
          style={{
            background: "rgba(243, 165, 165, 0.1)",
            borderColor: "#f3a5a5",
            color: "#f3a5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* Occasion Type */}
      <div>
        <label className={labelClass} style={{ color: "var(--blush)" }}>
          Occasion Type <span style={{ color: "var(--gold-dim)" }}>*</span>
        </label>
        <select
          className={inputClass}
          style={{
            ...inputStyle,
            appearance: "auto",
            cursor: "pointer",
          }}
          value={form.occasion_type}
          onChange={handleOccasionChange}
        >
          {occasionOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              style={{
                background: "var(--wine-900)",
                color: "var(--ivory)",
              }}
            >
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.occasion_type && (
          <p className="text-sm mt-1" style={{ color: "#f3a5a5" }}>
            {fieldErrors.occasion_type}
          </p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass} style={{ color: "var(--blush)" }}>
          URL Slug <span style={{ color: "var(--gold-dim)" }}>*</span>
        </label>
        <input
          className={`${inputClass} ${fieldErrors.slug ? "border-red-500" : ""}`}
          style={inputStyle}
          placeholder="your-event-slug"
          value={form.slug}
          onChange={(e) => setField("slug", e.target.value)}
        />
        <p className="text-xs mt-1" style={{ color: "var(--gold-dim)" }}>
          This will be the URL: /event/{form.slug || "your-event-slug"}
        </p>
        {fieldErrors.slug && (
          <p className="text-sm mt-1" style={{ color: "#f3a5a5" }}>
            {fieldErrors.slug}
          </p>
        )}
      </div>

      {/* Recipient Name */}
      <div>
        <label className={labelClass} style={{ color: "var(--blush)" }}>
          Recipient's Name <span style={{ color: "var(--gold-dim)" }}>*</span>
        </label>
        <input
          className={`${inputClass} ${fieldErrors.recipient_name ? "border-red-500" : ""}`}
          style={inputStyle}
          value={form.recipient_name}
          onChange={(e) => setField("recipient_name", e.target.value)}
        />
        {fieldErrors.recipient_name && (
          <p className="text-sm mt-1" style={{ color: "#f3a5a5" }}>
            {fieldErrors.recipient_name}
          </p>
        )}
      </div>

      {/* Target Date */}
      <div>
        <label className={labelClass} style={{ color: "var(--blush)" }}>
          Reveal Date &amp; Time{" "}
          <span style={{ color: "var(--gold-dim)" }}>
            * (page unlocks at this moment)
          </span>
        </label>
        <input
          type="datetime-local"
          className={`${inputClass} ${fieldErrors.target_date ? "border-red-500" : ""}`}
          style={inputStyle}
          value={form.target_date}
          onChange={(e) => setField("target_date", e.target.value)}
        />
        {fieldErrors.target_date && (
          <p className="text-sm mt-1" style={{ color: "#f3a5a5" }}>
            {fieldErrors.target_date}
          </p>
        )}
      </div>

      {/* Countdown Section */}
      <div className="border-t pt-4" style={{ borderColor: "var(--gold-dim)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--gold-soft)" }}>
          Countdown Settings
        </p>
        <div className="space-y-3">
          {/* Envelope Letter Mark - FIXED */}
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Envelope Letter Mark
            </label>
            <div>
              <input
                className={inputClass}
                style={inputStyle}
                value={form.envelope_letter_mark}
                onChange={(e) =>
                  setField("envelope_letter_mark", e.target.value)
                }
                placeholder={`Default: ${currentOccasionDefaults.envelope_letter_mark}`}
              />
              <p className="text-xs mt-1" style={{ color: "var(--gold-dim)" }}>
                {userOverrides.envelope_letter_mark
                  ? "✓ Custom value (editing will keep this custom value)"
                  : `Auto: "${currentOccasionDefaults.envelope_letter_mark}" (edit to customize)`}
              </p>
            </div>
          </div>

          {/* Countdown Eyebrow */}
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Countdown Eyebrow (before reveal)
            </label>
            <div>
              <input
                className={inputClass}
                style={inputStyle}
                value={form.countdown_eyebrow}
                onChange={(e) => setField("countdown_eyebrow", e.target.value)}
                placeholder={`Default: ${currentOccasionDefaults.countdown_eyebrow}`}
              />
              <p className="text-xs mt-1" style={{ color: "var(--gold-dim)" }}>
                {userOverrides.countdown_eyebrow
                  ? "✓ Custom value (editing will keep this custom value)"
                  : `Auto: "${currentOccasionDefaults.countdown_eyebrow}" (edit to customize)`}
              </p>
            </div>
          </div>

          {/* Countdown Arrived */}
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Countdown Arrived (after reveal)
            </label>
            <div>
              <input
                className={inputClass}
                style={inputStyle}
                value={form.countdown_arrived}
                onChange={(e) => setField("countdown_arrived", e.target.value)}
                placeholder={`Default: ${currentOccasionDefaults.countdown_arrived}`}
              />
              <p className="text-xs mt-1" style={{ color: "var(--gold-dim)" }}>
                {userOverrides.countdown_arrived
                  ? "✓ Custom value (editing will keep this custom value)"
                  : `Auto: "${currentOccasionDefaults.countdown_arrived}" (edit to customize)`}
              </p>
            </div>
          </div>

          {/* Section Eyebrow */}
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Section Eyebrow
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.section_eyebrow}
              onChange={(e) => setField("section_eyebrow", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Locked Screen Section */}
      <div className="border-t pt-4" style={{ borderColor: "var(--gold-dim)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--gold-soft)" }}>
          Locked-screen Text (shown before the reveal date)
        </p>
        <div className="space-y-3">
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Waiting Message
            </label>
            <textarea
              rows={2}
              className={inputClass}
              style={inputStyle}
              value={form.locked_message}
              onChange={(e) => setField("locked_message", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Footer Line
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.locked_footer}
              onChange={(e) => setField("locked_footer", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div className="border-t pt-4" style={{ borderColor: "var(--gold-dim)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--gold-soft)" }}>
          Revealed Content (shown after reveal date)
        </p>
        <div className="space-y-3">
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Message / Letter
            </label>
            <textarea
              rows={6}
              className={inputClass}
              style={inputStyle}
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Signature
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.signature}
              onChange={(e) => setField("signature", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--blush)" }}>
              Closing Line
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.closing_line}
              onChange={(e) => setField("closing_line", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-6 py-2.5 text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{
            background: "var(--gold)",
            color: "var(--wine-950)",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving…
            </span>
          ) : (
            "Save Changes"
          )}
        </button>

        {saved && (
          <span
            className="text-sm flex items-center gap-1"
            style={{ color: "#86efac" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Saved
          </span>
        )}

        {isDirty && !saving && (
          <span className="text-xs" style={{ color: "var(--gold-dim)" }}>
            You have unsaved changes
          </span>
        )}
      </div>
    </form>
  );
}
