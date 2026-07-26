import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "var(--wine-950)" }}
    >
      <h1 className="font-display text-4xl mb-3" style={{ color: "var(--gold-soft)" }}>
        Smriti Box
      </h1>
      <p className="max-w-md mb-8" style={{ color: "var(--blush)" }}>
        Build a beautiful, private page of memories for someone's birthday, anniversary, or any day
        that matters — then share one link.
      </p>
      <div className="flex gap-3">
        <Link
          to="/register"
          className="rounded-lg px-5 py-2.5 text-sm font-medium"
          style={{ background: "var(--gold)", color: "var(--wine-950)" }}
        >
          Get started
        </Link>
        <Link
          to="/login"
          className="rounded-lg px-5 py-2.5 text-sm font-medium border"
          style={{ borderColor: "var(--gold-dim)", color: "var(--gold-soft)" }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
