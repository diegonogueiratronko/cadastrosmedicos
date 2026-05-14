import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AcessoMedico() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { authMedico } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErro("");
    const ok = await authMedico(senha);
    setLoading(false);
    if (ok) {
      navigate("/cadastro");
    } else {
      setErro("Senha incorreta. Verifique com a Unimed.");
    }
  };

  return (
    <div className="min-h-screen auth-bg flex flex-col">
      {/* Logo */}
      <div className="pt-12 text-center relative z-10">
        <h2 className="font-heading font-bold text-2xl text-tertiary">Tronko</h2>
        <p className="text-xs text-white/50 tracking-widest uppercase mt-1">Unimed CNU</p>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
          <div className="bg-card rounded-2xl p-8 shadow-2xl">
            <h2 className="font-heading font-bold text-xl text-card-foreground text-center mb-1">
              Cadastro de Profissional PJ
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Unimed CNU · Credenciamento Digital
            </p>

            <label className="text-sm font-medium text-card-foreground block mb-2">Senha de acesso</label>
            <div className="relative mb-3">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(""); }}
                className="pl-10"
              />
            </div>
            {erro && <p className="text-sm text-destructive mb-3">{erro}</p>}
            <Button type="submit" disabled={loading || !senha} className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold h-12 text-base">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validando...</>) : (<>Entrar <ArrowRight className="w-4 h-4 ml-2" /></>)}
            </Button>

            <div className="mt-5 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">Acesso exclusivo para credenciamento profissional</p>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="py-4 flex items-center justify-center gap-6 text-xs text-white/40 relative z-10">
        <span>© 2026 TRONKO - INOVAÇÃO</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          Unimed CNU
        </span>
      </footer>
    </div>
  );
}
