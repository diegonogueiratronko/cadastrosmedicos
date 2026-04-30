import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { buscarCadastros, executarAcao } from "@/services/dashboardService";
import { CadastroRegistro } from "@/types/cadastro";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

function filtrarPendentesVisiveis(cadastros: CadastroRegistro[], processados: Set<string>) {
  const idsComStatusFinal = new Set(
    cadastros.filter((c) => c.status !== "PENDENTE").map((c) => c.idUnico)
  );

  const pendentesUnicos = new Map<string, CadastroRegistro>();

  for (const cadastro of cadastros) {
    if (cadastro.status !== "PENDENTE") continue;
    if (processados.has(cadastro.idUnico)) continue;
    if (idsComStatusFinal.has(cadastro.idUnico)) continue;
    if (!pendentesUnicos.has(cadastro.idUnico)) {
      pendentesUnicos.set(cadastro.idUnico, cadastro);
    }
  }

  return Array.from(pendentesUnicos.values());
}

export default function Aprovacoes() {
  const { profile, user } = useAuth();
  const [cadastros, setCadastros] = useState<CadastroRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [processando, setProcessando] = useState<string | null>(null);
  // IDs já aprovados/rejeitados nesta sessão — nunca devem voltar à tela,
  // mesmo que o webhook ainda devolva dados desatualizados (Sheets demora a propagar).
  const processadosRef = useRef<Set<string>>(new Set());

  const carregar = async () => {
    setLoading(true);
    setError("");

    const resultado = await buscarCadastros();
    if (resultado && resultado.kpis) {
      setCadastros(filtrarPendentesVisiveis(resultado.cadastros, processadosRef.current));
    } else {
      setCadastros([]);
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }

    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const recarregarComRetry = async (idUnico: string, statusEsperado: "OK" | "ERRO") => {
    // Espera o backend (Google Sheets) propagar antes do primeiro fetch.
    // Sem delay=0: aquele primeiro tick devolvia o item ainda como PENDENTE
    // e sobrescrevia a remoção otimista, fazendo o card "voltar" para a tela.
    const delays = [1500, 2500, 4000, 5000];
    for (const delay of delays) {
      await new Promise((r) => setTimeout(r, delay));
      const resultado = await buscarCadastros();
      if (!resultado) continue;
      const item = resultado.cadastros.find((c) => c.idUnico === idUnico);
      // Confirmado quando o item sumiu OU já reflete o status esperado
      if (!item || item.status === statusEsperado || item.status !== "PENDENTE") {
        setCadastros(filtrarPendentesVisiveis(resultado.cadastros, processadosRef.current));
        return;
      }
    }
    // Backend ainda não propagou — mantém a remoção otimista local
    setCadastros((prev) => prev.filter((c) => c.idUnico !== idUnico));
  };

  const aprovar = async (idUnico: string) => {
    if (processando) return;
    setProcessando(idUnico);
    try {
      const resultado = await executarAcao(idUnico, "OK", "", profile?.nome_completo || user?.email || "admin");
      if (resultado && resultado.sucesso === false) {
        toast.error(resultado.mensagem || resultado.erro || "Erro ao aprovar cadastro", { duration: 4000 });
        return;
      }
      // Marca como processado para nunca mais voltar à tela
      processadosRef.current.add(idUnico);
      // Atualização otimista — remove o card imediatamente
      setCadastros((prev) => prev.filter((c) => c.idUnico !== idUnico));
      toast.success("Cadastro aprovado com sucesso!", { duration: 4000 });
      // Refetch em background com retry para confirmar com o backend
      recarregarComRetry(idUnico, "OK");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro de conexão. Tente novamente.", { duration: 4000 });
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
      const resultado = await executarAcao(idUnico, "ERRO", motivo, profile?.nome_completo || user?.email || "admin");
      if (resultado && resultado.sucesso === false) {
        toast.error(resultado.mensagem || resultado.erro || "Erro ao rejeitar cadastro", { duration: 4000 });
        return;
      }
      // Marca como processado para nunca mais voltar à tela
      processadosRef.current.add(idUnico);
      // Atualização otimista — remove o card imediatamente
      setCadastros((prev) => prev.filter((c) => c.idUnico !== idUnico));
      toast.success("Cadastro rejeitado com sucesso!", { duration: 4000 });
      setRejeitando(null);
      setMotivo("");
      // Refetch em background com retry para confirmar com o backend
      recarregarComRetry(idUnico, "ERRO");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro de conexão. Tente novamente.", { duration: 4000 });
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

        {!loading && !error && (
          <p className="text-sm text-muted-foreground">{cadastros.length} cadastro(s) pendente(s)</p>
        )}

        {!loading && cadastros.length === 0 && !error && (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground">🎉 Nenhum cadastro pendente no momento</p>
            <p className="text-sm text-muted-foreground mt-1">Todos os cadastros foram processados.</p>
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
