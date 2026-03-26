import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, CheckCircle, FolderOpen,
  Settings, LogOut, Bell, User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Cadastros", icon: ClipboardList, path: "/admin/cadastros" },
  { label: "Aprovações", icon: CheckCircle, path: "/admin/aprovacoes" },
  { label: "Documentos", icon: FolderOpen, path: "/admin/documentos" },
  { label: "Configurações", icon: Settings, path: "/admin/configuracoes" },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/cadastros": "Cadastros",
  "/admin/aprovacoes": "Aprovações",
  "/admin/documentos": "Documentos",
  "/admin/configuracoes": "Configurações",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { adminUser, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  const pageTitle = pageTitles[location.pathname] || "Admin";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-card shadow-sm border-r border-border fixed h-full z-30">
        {/* Logo */}
        <div className="p-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-secondary-foreground font-heading font-bold text-sm">T</span>
          </div>
          <span className="font-heading font-bold text-foreground">Tronko</span>
        </div>

        {/* Admin info */}
        <div className="px-5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{adminUser?.nome}</p>
            <span className="text-xs bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
        </div>

        <div className="mx-5 my-2 h-px bg-border" />

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mx-5 my-2 h-px bg-border" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
          <h1 className="font-heading font-bold text-lg text-foreground">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">3</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-secondary" />
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
              activeClassName="border-secondary text-secondary font-medium"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
