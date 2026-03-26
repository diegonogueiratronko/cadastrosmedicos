import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

export function RequireMedico({ children }: { children: ReactNode }) {
  const { isMedicoAuthed } = useAuth();
  if (!isMedicoAuthed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { adminUser } = useAuth();
  if (!adminUser) return <Navigate to="/login-admin" replace />;
  return <>{children}</>;
}
