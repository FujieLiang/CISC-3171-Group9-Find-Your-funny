import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-mono-accent text-sm uppercase tracking-wider text-stark/70">
      Warming up the mic…
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
