import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarMsgEsqueci, setMostrarMsgEsqueci] = useState(false);
  const { signIn, profileError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { error } = await signIn(email, senha);
    setCarregando(false);

    if (error) {
      setErro(error);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen auth-bg flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
          <div className="bg-card rounded-2xl p-8 shadow-2xl">
            <h2 className="font-heading font-bold text-xl text-tertiary text-center mb-0.5">Tronko</h2>
            <h3 className="font-heading font-bold text-lg text-card-foreground text-center mb-1">Dashboard Administrativo</h3>
            <p className="text-xs text-muted-foreground text-center mb-6">Acesso restrito · Setor de Cadastros</p>

            {(erro || profileError) && (
              <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg px-4 py-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-words">{erro || profileError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErro(""); }}
                    className="pl-10"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-card-foreground">Senha</label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setMostrarMsgEsqueci(true)}
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setErro(""); }}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {mostrarMsgEsqueci && (
              <p className="text-xs text-muted-foreground mt-3 bg-muted/50 rounded-lg px-3 py-2">
                Para redefinir sua senha, entre em contato com o administrador do sistema.
              </p>
            )}

            <Button
              type="submit"
              disabled={carregando}
              className="w-full mt-5 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold h-12 text-base"
            >
              {carregando ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
              ) : (
                <>Entrar <LogIn className="w-4 h-4 ml-2" /></>
              )}
            </Button>

            <div className="mt-5 pt-4 border-t border-border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TRONKO COE · UNIMED CNU · V1.0</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-white/40">
            <Link to="/" className="hover:text-white/60 transition-colors">Voltar ao início</Link>
          </div>
        </form>
      </div>

      <div className="absolute bottom-6 right-6 z-10">
        <span className="flex items-center gap-1.5 bg-secondary/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          Unimed CNU
        </span>
      </div>
    </div>
  );
}
