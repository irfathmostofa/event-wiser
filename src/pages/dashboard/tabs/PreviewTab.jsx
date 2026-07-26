import { useRef, useState } from "react";

export default function PreviewTab({ event }) {
  const iframeRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Intentionally not rendered as a clickable/copyable link or `<a href>` —
  // regular users shouldn't see or be able to share the preview URL before
  // it's paid for and approved. Only the admin panel links to it directly.
  const previewPath = `/preview/${event.id}`;

  function goFullscreen() {
    iframeRef.current?.requestFullscreen?.();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm" style={{ color: "var(--blush)" }}>
          This is exactly what {event.recipient_name || "your recipient"} will see — click the envelope
          to open it, same as the real page.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium border"
            style={{ borderColor: "var(--gold-dim)", color: "var(--gold-soft)" }}
          >
            Refresh preview
          </button>
          <button
            onClick={goFullscreen}
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{ background: "var(--gold)", color: "var(--wine-950)" }}
          >
            Fullscreen
          </button>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: "var(--gold-dim)", height: "70vh" }}
      >
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={previewPath}
          title="Event preview"
          className="w-full h-full"
          style={{ border: "none", background: "var(--wine-950)" }}
        />
      </div>
    </div>
  );
}
