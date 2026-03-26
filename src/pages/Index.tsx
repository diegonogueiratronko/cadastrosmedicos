import { Link } from "react-router-dom";
import { Stethoscope, LayoutDashboard, FileText } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col auth-bg">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">T</span>
          </div>
          <span className="font-heading font-bold text-white">Tronko</span>
        </div>
        <span className="font-heading font-semibold text-tertiary text-sm">Unimed CNU</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-2xl w-full text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
            Portal de Cadastro Médico PJ
          </h1>
          <p className="text-white/60 text-lg mb-12">
            Sistema automatizado de credenciamento — Unimed CNU
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto">
            {/* Card Médico */}
            <Link
              to="/acesso-medico"
              className="group bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-card-foreground mb-1">Sou Médico</h2>
              <p className="text-sm text-muted-foreground">Realizar meu cadastro</p>
            </Link>

            {/* Card Admin */}
            <Link
              to="/login-admin"
              className="group bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="font-heading font-bold text-card-foreground mb-1">Sou Administrador</h2>
              <p className="text-sm text-muted-foreground">Acessar painel de gestão</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-white/40 relative z-10">
        Tronko Innovation Office © 2026 — Cadastros Médicos
      </footer>
    </div>
  );
}
