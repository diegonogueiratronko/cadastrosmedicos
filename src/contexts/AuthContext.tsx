import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ADMIN_CREDENTIALS, MEDICO_PINS } from "@/config/api";

interface AdminUser {
  email: string;
  nome: string;
}

interface AuthContextType {
  adminUser: AdminUser | null;
  isMedicoAuthed: boolean;
  loginAdmin: (email: string, senha: string) => boolean;
  logoutAdmin: () => void;
  authMedico: (senha: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const stored = sessionStorage.getItem("admin_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [isMedicoAuthed, setIsMedicoAuthed] = useState(() => {
    return sessionStorage.getItem("medico_auth") === "true";
  });

  const loginAdmin = useCallback((email: string, senha: string): boolean => {
    const found = ADMIN_CREDENTIALS.find(
      (c) => c.email === email && c.senha === senha
    );
    if (found) {
      const user = { email: found.email, nome: found.nome };
      setAdminUser(user);
      sessionStorage.setItem("admin_user", JSON.stringify(user));
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    sessionStorage.removeItem("admin_user");
  }, []);

  const authMedico = useCallback((senha: string): boolean => {
    if (senha === SENHA_MEDICO) {
      setIsMedicoAuthed(true);
      sessionStorage.setItem("medico_auth", "true");
      return true;
    }
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{ adminUser, isMedicoAuthed, loginAdmin, logoutAdmin, authMedico }}>
      {children}
    </AuthContext.Provider>
  );
};
