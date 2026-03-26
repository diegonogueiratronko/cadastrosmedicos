import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(email, senha)) {
      navigate("/admin/dashboard");
    } else {
      setErro("Credenciais inválidas.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
        <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <LogIn className="w-7 h-7 text-secondary" />
            </div>
          </div>
          <h2 className="font-heading font-bold text-xl text-foreground text-center mb-1">Painel Administrativo</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Tronko — Unimed CNU</p>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErro(""); }}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
            />
          </div>
          {erro && <p className="text-sm text-destructive mt-3">{erro}</p>}
          <Button type="submit" className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            Entrar
          </Button>
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Voltar ao início
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
