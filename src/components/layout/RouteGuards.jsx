import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="screen-loading">Loading…</div>;
  if (profile?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}
