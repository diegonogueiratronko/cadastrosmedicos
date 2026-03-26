import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { fetchCadastros } from "@/services/dashboardService";
import { CadastroRegistro } from "@/types/cadastro";
import { toast } from "sonner";

export default function Aprovacoes() {
  const [cadastros, setCadastros] = useState<CadastroRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchCadastros()
      .then((data) => setCadastros(data.filter(c => c.status === "PENDENTE")))
      .catch(() => setError("Erro ao carregar cadastros."))
      .finally(() => setLoading(false));
  }, []);

  const aprovar = (id: string) => {
    setCadastros((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cadastro aprovado com sucesso!");
  };

  const rejeitar = (id: string) => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo da rejeição.");
      return;
    }
    setCadastros((prev) => prev.filter((c) => c.id !== id));
    setRejeitando(null);
    setMotivo("");
    toast.success("Cadastro rejeitado.");
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {error && <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{error}</div>}

        {!loading && !error && (
          <p className="text-sm text-muted-foreground">{cadastros.length} cadastro(s) pendente(s)</p>
        )}

        {!loading && cadastros.length === 0 && !error && (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground">Nenhum cadastro pendente</p>
            <p className="text-sm text-muted-foreground mt-1">Os dados serão carregados via integração n8n.</p>
          </div>
        )}

        {cadastros.map((c) => (
          <div key={c.id} className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{c.nome}</h3>
                <p className="text-sm text-muted-foreground">CRM {c.crm}/{c.ufCrm} · {c.especialidade} · {c.dataCadastro}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => aprovar(c.id)} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                  <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRejeitando(rejeitando === c.id ? null : c.id)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                </Button>
              </div>
            </div>

            {rejeitando === c.id && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo da rejeição..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
                <Button size="sm" variant="destructive" onClick={() => rejeitar(c.id)}>
                  Confirmar Rejeição
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
