import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, CheckCircle, FolderOpen,
  Settings, LogOut, Bell, HelpCircle, User, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Cadastros", icon: ClipboardList, path: "/admin/cadastros" },
  { label: "Pendentes", icon: FolderOpen, path: "/admin/aprovacoes" },
  { label: "Aprovados", icon: CheckCircle, path: "/admin/documentos" },
  { label: "Insights IA", icon: Sparkles, path: "/admin/insights", badge: "IA" },
  { label: "Configurações", icon: Settings, path: "/admin/configuracoes" },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/cadastros": "Cadastros",
  "/admin/aprovacoes": "Pendentes",
  "/admin/documentos": "Aprovados",
  "/admin/insights": "Insights com IA",
  "/admin/configuracoes": "Configurações",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair?")) {
      await signOut();
      navigate("/login-admin", { replace: true });
    }
  };

  const pageTitle = pageTitles[location.pathname] || "Admin";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar — dark teal */}
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar fixed h-full z-30">
        {/* Logo */}
        <div className="p-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-heading font-bold text-sm">T</span>
          </div>
          <div>
            <span className="font-heading font-bold text-tertiary">Cadastros Profissionais</span>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Tronko - Inovação</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 mt-2 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-muted transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {(item as any).badge && (
                <span className="ml-auto text-[10px] font-bold bg-[#8B5CF6] text-white px-1.5 py-0.5 rounded-full">{(item as any).badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin info at bottom */}
        <div className="px-3 pb-2">
          <div className="px-3 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-muted flex items-center justify-center">
              <User className="w-4 h-4 text-sidebar-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.nome_completo}</p>
              <span className="text-[10px] text-sidebar-foreground/50">{profile?.role === "admin" ? "Administrador" : "Analista"}</span>
            </div>
          </div>
        </div>

        <div className="mx-3 h-px bg-sidebar-border" />

        <div className="px-3 py-2 space-y-1">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-muted transition-colors">
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-primary hover:bg-sidebar-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
          <h1 className="font-heading font-bold text-lg text-foreground">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">3</span>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="lg:hidden flex overflow-x-auto border-b border-border bg-card px-4 gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground whitespace-nowrap border-b-2 border-transparent"
              activeClassName="border-primary text-primary font-medium"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-3 px-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
          <span><span className="text-primary font-medium">Cadastros Profissionais</span> | © 2026 Tronko - Inovação</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Termos</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Suporte</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
