import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const BKASH_NUMBER = "01XXXXXXXXX"; // TODO: replace with your real bKash merchant/personal number

export default function PublishTab({ event, usedImages = 0, onUpdate }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnId, setTxnId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // Calculate verified extra slots
  const verifiedExtraSlots = payments
    .filter((p) => p.type === "extra_images" && p.status === "verified")
    .reduce((sum, p) => sum + p.quantity, 0);

  // Calculate overage (images beyond free 20)
  const overage = Math.max(0, usedImages - 20);

  // Calculate extra slots needed (overage minus already verified extra slots)
  const extraSlotsNeeded = Math.max(0, overage - verifiedExtraSlots);

  // Calculate total cost
  const publishCost = 500;
  const extraCost = extraSlotsNeeded * 50;
  const totalCost = publishCost + extraCost;

  // Check if event is already published
  const isPublished = event.is_published;

  // Check if all extra slots are verified
  const allExtrasVerified = extraSlotsNeeded === 0;

  const publicUrl = `${window.location.origin}/e/${event.slug}`;
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Submit publish payment
      const { error: publishError } = await supabase.from("payments").insert({
        event_id: event.id,
        type: "publish",
        amount: publishCost,
        quantity: 1,
        bkash_txn_id: txnId,
        bkash_number: senderNumber,
      });

      if (publishError) {
        alert("Failed to submit payment: " + publishError.message);
        setSubmitting(false);
        return;
      }

      // Submit extra images payment if needed
      if (extraSlotsNeeded > 0) {
        const { error: extraError } = await supabase.from("payments").insert({
          event_id: event.id,
          type: "extra_images",
          amount: extraCost,
          quantity: extraSlotsNeeded,
          bkash_txn_id: txnId,
          bkash_number: senderNumber,
        });

        if (extraError) {
          alert("Failed to submit extra images payment: " + extraError.message);
          setSubmitting(false);
          return;
        }
      }

      // Clear form and reload
      setTxnId("");
      setSenderNumber("");
      await load();

      // Refresh event data in parent
      if (onUpdate) {
        const { data } = await supabase
          .from("events")
          .select("*")
          .eq("id", event.id)
          .single();
        if (data) onUpdate(data);
      }

      alert(
        "Payment submitted successfully! We'll verify and publish within a few hours.",
      );
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // If event is published, show success state
  if (isPublished) {
    return (
      <div className="max-w-xl space-y-6">
        <div
          className="rounded-lg p-4 text-sm"
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <p className="font-medium mb-1" style={{ color: "#86efac" }}>
            🎉 This page is live!
          </p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="underline break-all block mt-1"
            style={{ color: "#86efac" }}
          >
            {publicUrl}
          </a>
        </div>

        {/* Show extra slots if still needed */}
        {extraSlotsNeeded > 0 && !hasPendingExtras && (
          <div className="border rounded-xl p-5" style={cardStyle}>
            <h3
              className="font-display text-lg mb-1"
              style={{ color: "var(--gold-soft)" }}
            >
              Need More Image Slots
            </h3>
            <p className="text-sm mb-1" style={{ color: "var(--blush)" }}>
              You've used {usedImages} images but only have{" "}
              {20 + verifiedExtraSlots} slots available.
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--blush)" }}>
              Need {extraSlotsNeeded} more slot{extraSlotsNeeded > 1 ? "s" : ""}{" "}
              (৳{extraSlotsNeeded * 50}). Send ৳{extraCost} via bKash to{" "}
              <span className="font-medium">{BKASH_NUMBER}</span>.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
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
                {submitting
                  ? "Submitting…"
                  : `Pay ৳${extraCost} for extra slots`}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Main publish card */}
      <div className="border rounded-xl p-5" style={cardStyle}>
        <h3
          className="font-display text-lg mb-1"
          style={{ color: "var(--gold-soft)" }}
        >
          Publish Your Page
        </h3>

        <div className="space-y-2 text-sm" style={{ color: "var(--blush)" }}>
          <p>
            <span className="font-medium" style={{ color: "var(--gold-soft)" }}>
              Images used:
            </span>{" "}
            {usedImages} / 20 free
            {overage > 0 && (
              <span style={{ color: "var(--gold)" }}>
                {" "}
                ({overage} over — ৳{extraCost} extra)
              </span>
            )}
          </p>
          <p>
            <span className="font-medium" style={{ color: "var(--gold-soft)" }}>
              Total cost:
            </span>{" "}
            ৳{totalCost}
            {extraSlotsNeeded > 0 && (
              <span style={{ color: "var(--gold)" }}>
                {" "}
                (৳{publishCost} publish + ৳{extraCost} for {extraSlotsNeeded}{" "}
                extra slot{extraSlotsNeeded > 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>

        <div
          className="mt-4 p-3 rounded-lg text-sm"
          style={{ background: "var(--wine-800)" }}
        >
          <p style={{ color: "var(--blush)" }}>
            Send{" "}
            <span className="font-medium" style={{ color: "var(--gold)" }}>
              ৳{totalCost}
            </span>{" "}
            via bKash to{" "}
            <span className="font-medium" style={{ color: "var(--gold-soft)" }}>
              {BKASH_NUMBER}
            </span>{" "}
            (Send Money), then submit the transaction ID below.
          </p>
        </div>

        {pendingPublish ? (
          <div
            className="mt-4 text-sm rounded-lg px-3 py-2"
            style={{
              background: "rgba(245,158,11,0.12)",
              color: "var(--gold-soft)",
            }}
          >
            ⏳ Payment submitted — waiting for verification. You'll receive an
            email when your page is published.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-4">
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
              disabled={submitting || pendingPublish}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: "var(--gold)", color: "var(--wine-950)" }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
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
                  Submitting…
                </span>
              ) : (
                `Pay ৳${totalCost} & Publish`
              )}
            </button>
          </form>
        )}
      </div>

      {/* Payment history */}
      {!loading && payments.length > 0 && (
        <div>
          <h4
            className="text-sm font-medium mb-2"
            style={{ color: "var(--gold-soft)" }}
          >
            Payment History
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
                    ? "Publish (৳500)"
                    : `${p.quantity} extra image${p.quantity > 1 ? "s" : ""} (৳${p.amount})`}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize"
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

      {/* Info about free slots */}
      <div className="text-xs" style={{ color: "var(--gold-dim)" }}>
        <p>💡 Free tier includes 20 images across timeline + gallery.</p>
        <p>
          Extra images: ৳50 each. You currently have {20 + verifiedExtraSlots}{" "}
          slots available.
        </p>
      </div>
    </div>
  );
}
