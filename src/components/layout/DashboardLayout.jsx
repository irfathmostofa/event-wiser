import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--wine-950)" }}>
      <header className="border-b" style={{ borderColor: "var(--gold-dim)", background: "var(--wine-900)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="font-display text-xl" style={{ color: "var(--gold-soft)" }}>
            Smriti Box
          </Link>
          <nav className="flex items-center gap-5 text-sm" style={{ color: "var(--blush)" }}>
            <Link to="/dashboard" className="hover:opacity-80" style={{ color: "var(--blush)" }}>
              My events
            </Link>
            {isAdmin && (
              <Link to="/admin" className="hover:opacity-80" style={{ color: "var(--blush)" }}>
                Admin
              </Link>
            )}
            <span className="hidden sm:inline" style={{ color: "var(--gold-dim)" }}>
              {profile?.full_name}
            </span>
            <button onClick={handleSignOut} className="hover:opacity-80" style={{ color: "var(--blush)" }}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
