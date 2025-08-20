import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { loading, session } = useAuth();
  if (loading) return null; // ou um spinner
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const { loading, session, profile } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/auth" replace />;
  if (profile?.role !== "admin") return <Navigate to="/painel" replace />;
  return children;
}
