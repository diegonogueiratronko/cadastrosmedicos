import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { buscarCadastros, executarAcao } from "@/services/dashboardService";
import { mockDashboardData } from "@/services/dashboardMock";
import { CadastroRegistro } from "@/types/cadastro";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Aprovacoes() {
  const { adminUser } = useAuth();
  const [cadastros, setCadastros] = useState<CadastroRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [usandoMock, setUsandoMock] = useState(false);
  const [processando, setProcessando] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    setError("");

    const resultado = await buscarCadastros();
    if (resultado && resultado.kpis) {
      setCadastros(resultado.cadastros.filter((c) => c.status === "PENDENTE"));
      setUsandoMock(false);
    } else {
      setCadastros(mockDashboardData.cadastros.filter((c) => c.status === "PENDENTE"));
      setUsandoMock(true);
      setError("Não foi possível carregar os dados reais. Exibindo dados de demonstração.");
    }

    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const aprovar = async (idUnico: string) => {
    if (processando) return;
    setProcessando(idUnico);
    try {
      await executarAcao(idUnico, "OK", "", adminUser?.email || "admin@unimed.com");
      toast.success("Cadastro aprovado! Email enviado ao médico.");
      setCadastros((prev) => prev.filter((c) => c.idUnico !== idUnico));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao aprovar cadastro");
    } finally {
      setProcessando(null);
    }
  };

  const rejeitar = async (idUnico: string) => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo da rejeição.");
      return;
    }
    if (processando) return;
    setProcessando(idUnico);
    try {
      await executarAcao(idUnico, "ERRO", motivo, adminUser?.email || "admin@unimed.com");
      toast.success("Cadastro rejeitado. Email enviado ao médico com o motivo.");
      setRejeitando(null);
      setMotivo("");
      setCadastros((prev) => prev.filter((c) => c.idUnico !== idUnico));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao rejeitar cadastro");
    } finally {
      setProcessando(null);
    }
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

        {usandoMock && (
          <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
            Dados de demonstração
          </div>
        )}

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
          <div key={c.idUnico} className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{c.nome}</h3>
                <p className="text-sm text-muted-foreground">CRM {c.crm}/{c.ufCrm} · {c.especialidade} · {c.dataCadastro}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={!!processando} onClick={() => aprovar(c.idUnico)} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                  {processando === c.idUnico ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />} Aprovar
                </Button>
                <Button size="sm" variant="outline" disabled={!!processando} onClick={() => setRejeitando(rejeitando === c.idUnico ? null : c.idUnico)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                </Button>
              </div>
            </div>

            {rejeitando === c.idUnico && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo da rejeição..."
                  disabled={!!processando}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
                <Button size="sm" variant="destructive" disabled={!!processando} onClick={() => rejeitar(c.idUnico)}>
                  {processando === c.idUnico ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null} Confirmar Rejeição
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
