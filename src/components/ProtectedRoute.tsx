import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requiredRole?: "admin" | "agent" | "agency" | "user";
}

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user, loading, rolesLoading, hasRole } = useAuth();

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && !hasRole(requiredRole) && !hasRole("admin")) {
    // Redirect to the user's own portal
    if (hasRole("agent")) return <Navigate to="/agent" replace />;
    if (hasRole("agency")) return <Navigate to="/agency" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
