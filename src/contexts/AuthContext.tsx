import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { MEDICO_PINS } from "@/config/api";

export interface UserProfile {
  id: string;
  nome_completo: string;
  cargo: string | null;
  role: "admin" | "analista";
  ativo: boolean;
}

interface AuthContextType {
  // Supabase admin auth
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // Legacy medico PIN auth (formulário público)
  isMedicoAuthed: boolean;
  authMedico: (senha: string) => boolean;
  // Compat aliases used by existing admin pages
  adminUser: { email: string; nome: string } | null;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Legacy medico PIN
  const [isMedicoAuthed, setIsMedicoAuthed] = useState(() => {
    return sessionStorage.getItem("medico_auth") === "true";
  });

  const authMedico = useCallback((senha: string): boolean => {
    if (MEDICO_PINS.includes(senha)) {
      setIsMedicoAuthed(true);
      sessionStorage.setItem("medico_auth", "true");
      return true;
    }
    return false;
  }, []);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .schema("udc")
      .from("user_profiles")
      .select("id, nome_completo, cargo, role, ativo")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Erro ao carregar perfil:", error);
      setProfile(null);
      return;
    }

    if (!data.ativo) {
      await supabase.auth.signOut();
      setProfile(null);
      return;
    }

    setProfile(data as UserProfile);
  }

  useEffect(() => {
    // Set up listener BEFORE getSession
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg =
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : "Erro ao fazer login. Tente novamente.";
      return { error: msg };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  // Compat aliases for existing admin components
  const adminUser = profile
    ? { email: user?.email || "", nome: profile.nome_completo }
    : null;

  const logoutAdmin = () => {
    signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signOut,
        isMedicoAuthed,
        authMedico,
        adminUser,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
