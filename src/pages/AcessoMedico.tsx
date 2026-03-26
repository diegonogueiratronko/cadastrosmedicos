import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MinimalLayout from "@/components/layout/MinimalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AcessoMedico() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { authMedico } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMedico(senha)) {
      navigate("/cadastro");
    } else {
      setErro("Senha incorreta. Verifique com a Unimed.");
    }
  };

  return (
    <MinimalLayout title="Acesso ao Cadastro">
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
          <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
            </div>
            <h2 className="font-heading font-bold text-xl text-foreground text-center mb-1">Acesso ao Cadastro</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Digite a senha fornecida pela Unimed para prosseguir
            </p>
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
              className="mb-3"
            />
            {erro && <p className="text-sm text-destructive mb-3">{erro}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
              Acessar
            </Button>
          </div>
        </form>
      </div>
    </MinimalLayout>
  );
}
