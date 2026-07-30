import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const BKASH_NUMBER = "01941637656"; // TODO: replace with your real bKash merchant/personal number

export default function PublishTab({ event, usedImages = 0 }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnId, setTxnId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [extraQty, setExtraQty] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  // State for the copy feedback indicator
  const [copied, setCopied] = useState(false);

  const overage = Math.max(0, usedImages - 20);
  const publishTotal = 500 + overage * 50;

  async function load() {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("event_id", event.id)
      .order("submitted_at", { ascending: false });
    setPayments(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  const pendingPublish = payments.find(
    (p) => p.type === "publish" && p.status === "pending",
  );
  const hasPendingExtras = payments.some(
    (p) => p.type === "extra_images" && p.status === "pending",
  );

  async function submitPublishPayment(e) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("payments").insert({
      event_id: event.id,
      type: "publish",
      amount: publishTotal,
      quantity: overage, // extra images included in this same payment, beyond the base 20
      bkash_txn_id: txnId,
      bkash_number: senderNumber,
    });
    setSubmitting(false);
    if (!error) {
      setTxnId("");
      setSenderNumber("");
      load();
    }
  }

  async function submitExtraSlotsPayment(e) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("payments").insert({
      event_id: event.id,
      type: "extra_images",
      amount: extraQty * 50,
      quantity: extraQty,
      bkash_txn_id: txnId,
      bkash_number: senderNumber,
    });
    setSubmitting(false);
    if (!error) {
      setTxnId("");
      setSenderNumber("");
      load();
    }
  }

  const publicUrl = `${window.location.origin}/e/${event.slug}`;

  // Copy handler with temporary state timeout
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const inputStyle = {
    borderColor: "var(--gold-dim)",
    color: "var(--ivory)",
    background: "transparent",
  };
  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm placeholder:text-[var(--gold-dim)]";
  const cardStyle = {
    background: "var(--wine-900)",
    borderColor: "var(--gold-dim)",
  };

  return (
    <div className="max-w-xl space-y-6">
      {event.is_published && (
        <div
          className="rounded-lg p-4 text-sm"
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <p className="font-medium mb-2" style={{ color: "#86efac" }}>
            This page is live 🎉
          </p>

          {/* Flexbox layout container for URL & Copy Button */}
          <div className="flex items-center justify-between gap-3 bg-black/20 rounded-md p-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="underline break-all text-xs font-mono"
              style={{ color: "#86efac" }}
            >
              {publicUrl}
            </a>

            <button
              onClick={handleCopy}
              type="button"
              className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-all font-medium border"
              style={{
                borderColor: copied
                  ? "rgba(34,197,94,0.6)"
                  : "rgba(134,239,172,0.3)",
                color: "#86efac",
                backgroundColor: copied ? "rgba(34,197,94,0.2)" : "transparent",
              }}
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <svg
                    className="w-3.5 h-3.5"
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
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 002-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!event.is_published && (
        <div className="border rounded-xl p-5" style={cardStyle}>
          <h3
            className="font-display text-lg mb-1"
            style={{ color: "var(--gold-soft)" }}
          >
            Publish this page
          </h3>
          <p className="text-sm mb-1" style={{ color: "var(--blush)" }}>
            ৳500 covers 20 images across timeline + gallery. You've used{" "}
            {usedImages} so far
            {overage > 0 && ` — ${overage} over, at ৳50 each`}.
          </p>
          <p
            className="text-2xl font-display mb-3"
            style={{ color: "var(--gold-soft)" }}
          >
            Total: ৳{publishTotal}
            {overage > 0 && (
              <span
                className="text-sm font-normal ml-2"
                style={{ color: "var(--gold-dim)" }}
              >
                (৳500 + ৳{overage * 50})
              </span>
            )}
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--blush)" }}>
            Send ৳{publishTotal} via bKash to{" "}
            <span className="font-medium">{BKASH_NUMBER}</span> (Send Money),
            then submit the transaction ID below. We'll verify and publish
            within a few hours.
          </p>

          {pendingPublish ? (
            <p
              className="text-sm rounded-lg px-3 py-2"
              style={{
                background: "rgba(245,158,11,0.12)",
                color: "var(--gold-soft)",
              }}
            >
              Payment of ৳{pendingPublish.amount} submitted — waiting for
              verification.
            </p>
          ) : (
            <form onSubmit={submitPublishPayment} className="space-y-3">
              <input
                required
                placeholder="Your bKash number"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
              <input
                required
                placeholder="Transaction ID"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
                style={{ background: "var(--gold)", color: "var(--wine-950)" }}
              >
                {submitting ? "Submitting…" : `Submit ৳${publishTotal} payment`}
              </button>
            </form>
          )}
        </div>
      )}

      {event.is_published && (
        <div className="border rounded-xl p-5" style={cardStyle}>
          <h3
            className="font-display text-lg mb-1"
            style={{ color: "var(--gold-soft)" }}
          >
            Need more image slots?
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--blush)" }}>
            Your page is already published — buy more image slots at ৳50 each.
          </p>

          {hasPendingExtras ? (
            <p
              className="text-sm rounded-lg px-3 py-2"
              style={{
                background: "rgba(245,158,11,0.12)",
                color: "var(--gold-soft)",
              }}
            >
              Extra-slots payment submitted — waiting for verification.
            </p>
          ) : (
            <form onSubmit={submitExtraSlotsPayment} className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm" style={{ color: "var(--blush)" }}>
                  Extra images:
                </label>
                <input
                  type="number"
                  min={1}
                  value={extraQty}
                  onChange={(e) => setExtraQty(Number(e.target.value))}
                  className="w-20 rounded-lg border px-3 py-1.5 text-sm"
                  style={inputStyle}
                />
                <span className="text-sm" style={{ color: "var(--gold-dim)" }}>
                  = ৳{extraQty * 50}
                </span>
              </div>
              <input
                required
                placeholder="Your bKash number"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
              <input
                required
                placeholder="Transaction ID"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
                style={{
                  background: "var(--gold-dim)",
                  color: "var(--wine-950)",
                }}
              >
                {submitting ? "Submitting…" : "Submit payment"}
              </button>
            </form>
          )}
        </div>
      )}

      {!loading && payments.length > 0 && (
        <div>
          <h4
            className="text-sm font-medium mb-2"
            style={{ color: "var(--gold-soft)" }}
          >
            Payment history
          </h4>
          <div className="space-y-1.5">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm border rounded-lg px-3 py-2"
                style={cardStyle}
              >
                <span style={{ color: "var(--ivory)" }}>
                  {p.type === "publish"
                    ? p.quantity > 0
                      ? `Publish (৳500 + ${p.quantity} extra)`
                      : "Publish"
                    : `${p.quantity} extra images`}{" "}
                  — ৳{p.amount}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      p.status === "verified"
                        ? "rgba(34,197,94,0.15)"
                        : p.status === "rejected"
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(245,158,11,0.15)",
                    color:
                      p.status === "verified"
                        ? "#86efac"
                        : p.status === "rejected"
                          ? "#fca5a5"
                          : "#fcd34d",
                  }}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
