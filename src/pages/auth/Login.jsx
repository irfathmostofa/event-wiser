import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-lg px-4 py-2.5 outline-none border bg-transparent placeholder:text-[var(--gold-dim)]";
const inputStyle = { borderColor: "var(--gold-dim)", color: "var(--ivory)" };

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--wine-950)" }}>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-1" style={{ color: "var(--gold-soft)" }}>
          Smriti Box
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blush)" }}>
          Sign in to your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm mt-6" style={{ color: "var(--blush)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium" style={{ color: "var(--gold-soft)" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
