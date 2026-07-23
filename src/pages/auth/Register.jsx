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
  const [fieldErrors, setFieldErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Name validation
    if (!fullName.trim()) {
      errors.fullName = "Full name is required";
      isValid = false;
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter";
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate before submitting
    if (!validateForm()) {
      return;
    }

    setBusy(true);

    try {
      const { error, data } = await signUp(email, password, fullName);

      if (error) {
        // Handle specific Supabase error codes
        switch (error.message) {
          case "User already registered":
            setError(
              "This email is already registered. Please sign in instead.",
            );
            break;
          case "Password should be at least 6 characters":
            setError("Password must be at least 6 characters");
            break;
          case "Invalid email":
            setError("Please enter a valid email address");
            break;
          default:
            setError(
              error.message || "Failed to create account. Please try again.",
            );
        }
        return;
      }

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        // User already exists but hasn't confirmed email
        setError(
          "This email is already registered but not confirmed. Please check your inbox.",
        );
        return;
      }

      setDone(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 text-center"
        style={{ background: "var(--wine-950)" }}
      >
        <div className="max-w-sm">
          <h1
            className="font-display text-2xl mb-2"
            style={{ color: "var(--gold-soft)" }}
          >
            Check your email
          </h1>
          <p style={{ color: "var(--blush)" }}>
            We sent a confirmation link to{" "}
            <strong style={{ color: "var(--gold-soft)" }}>{email}</strong>.
            <br />
            Confirm it, then sign in.
          </p>
          <p className="mt-3 text-sm" style={{ color: "var(--blush)" }}>
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setDone(false)}
              className="font-medium underline"
              style={{ color: "var(--gold-soft)" }}
            >
              try again
            </button>
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--gold-soft)" }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--wine-950)" }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="font-display text-3xl mb-1"
          style={{ color: "var(--gold-soft)" }}
        >
          Create your account
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blush)" }}>
          Build a page for someone special
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              required
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) {
                  setFieldErrors({ ...fieldErrors, fullName: "" });
                }
              }}
              className={`${inputClass} ${fieldErrors.fullName ? "border-red-500" : ""}`}
              style={inputStyle}
            />
            {fieldErrors.fullName && (
              <p className="text-sm mt-1" style={{ color: "#f3a5a5" }}>
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: "" });
                }
                // Clear general error when user starts typing
                if (error) setError("");
              }}
              className={`${inputClass} ${fieldErrors.email ? "border-red-500" : ""}`}
              style={inputStyle}
            />
            {fieldErrors.email && (
              <p className="text-sm mt-1" style={{ color: "#f3a5a5" }}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: "" });
                }
                if (error) setError("");
              }}
              className={`${inputClass} ${fieldErrors.password ? "border-red-500" : ""}`}
              style={inputStyle}
            />
            {fieldErrors.password && (
              <p className="text-sm mt-1" style={{ color: "#f3a5a5" }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

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

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg py-2.5 font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
            style={{ background: "var(--gold)", color: "var(--wine-950)" }}
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="text-sm mt-6" style={{ color: "var(--blush)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--gold-soft)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
