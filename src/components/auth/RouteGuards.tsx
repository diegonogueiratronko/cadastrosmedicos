import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function RequireMedico({ children }: { children: ReactNode }) {
  const { isMedicoAuthed } = useAuth();
  if (!isMedicoAuthed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to="/login-admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
