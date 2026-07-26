import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const cardStyle = { background: "var(--wine-900)", borderColor: "var(--gold-dim)" };

export default function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("pending");

  async function load() {
    setLoading(true);
    let query = supabase
      .from("payments")
      .select("*, events(id, recipient_name, occasion_type, slug, is_published)")
      .order("submitted_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setPayments(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function verify(id) {
    setBusyId(id);
    const { error } = await supabase.rpc("verify_payment", { p_payment_id: id });
    setBusyId(null);
    if (error) alert(error.message);
    else load();
  }

  async function reject(id) {
    setBusyId(id);
    const { error } = await supabase.rpc("reject_payment", { p_payment_id: id });
    setBusyId(null);
    if (error) alert(error.message);
    else load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: "var(--gold-soft)" }}>
          Payment review
        </h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border bg-transparent px-3 py-1.5 text-sm"
          style={{ borderColor: "var(--gold-dim)", color: "var(--ivory)" }}
        >
          <option value="pending" style={{ color: "black" }}>Pending</option>
          <option value="verified" style={{ color: "black" }}>Verified</option>
          <option value="rejected" style={{ color: "black" }}>Rejected</option>
          <option value="all" style={{ color: "black" }}>All</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--blush)" }}>Loading…</p>
      ) : payments.length === 0 ? (
        <p style={{ color: "var(--blush)" }}>Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="border rounded-xl p-4 flex items-center justify-between gap-4" style={cardStyle}>
              <div>
                <p className="font-medium" style={{ color: "var(--ivory)" }}>
                  {p.events?.recipient_name}{" "}
                  <span className="font-normal" style={{ color: "var(--gold-dim)" }}>
                    · {p.events?.occasion_type} · /e/{p.events?.slug}
                  </span>
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--blush)" }}>
                  {p.type === "publish" ? "Publish" : `${p.quantity} extra images`} — ৳{p.amount} · txn{" "}
                  <span className="font-mono">{p.bkash_txn_id}</span> from {p.bkash_number}
                </p>
                {p.events?.id && (
                  <Link
                    to={`/preview/${p.events.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Preview page before deciding →
                  </Link>
                )}
              </div>
              {p.status === "pending" ? (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => verify(p.id)}
                    disabled={busyId === p.id}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-60"
                    style={{ background: "#166534", color: "#f0fdf4" }}
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => reject(p.id)}
                    disabled={busyId === p.id}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-60"
                    style={{ background: "#991b1b", color: "#fef2f2" }}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: p.status === "verified" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: p.status === "verified" ? "#86efac" : "#fca5a5",
                  }}
                >
                  {p.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
