import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-lg px-4 py-2.5 outline-none border bg-transparent placeholder:text-[var(--gold-dim)]";
const inputStyle = { borderColor: "var(--gold-dim)", color: "var(--ivory)" };

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await signUp(email, password, fullName);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 text-center"
        style={{ background: "var(--wine-950)" }}
      >
        <div className="max-w-sm">
          <h1 className="font-display text-2xl mb-2" style={{ color: "var(--gold-soft)" }}>
            Check your email
          </h1>
          <p style={{ color: "var(--blush)" }}>
            We sent a confirmation link to {email}. Confirm it, then sign in.
          </p>
          <Link to="/login" className="inline-block mt-6 font-medium" style={{ color: "var(--gold-soft)" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--wine-950)" }}>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-1" style={{ color: "var(--gold-soft)" }}>
          Create your account
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blush)" }}>
          Build a page for someone special
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
          {error && <p className="text-sm" style={{ color: "#f3a5a5" }}>{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg py-2.5 font-medium disabled:opacity-60"
            style={{ background: "var(--gold)", color: "var(--wine-950)" }}
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm mt-6" style={{ color: "var(--blush)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium" style={{ color: "var(--gold-soft)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
