import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buscarCadastros } from "@/services/dashboardService";
import { StatusCadastro, CadastroRegistro } from "@/types/cadastro";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { maskCpf, maskCnpj, maskEmail, maskTelefone, maskRg } from "@/utils/mask";

const statusColors: Record<StatusCadastro, string> = {
  PENDENTE: "bg-warning/15 text-warning",
  OK: "bg-primary/15 text-primary",
  ERRO: "bg-destructive/15 text-destructive",
  INATIVO: "bg-muted text-muted-foreground",
};

export default function Cadastros() {
  const [cadastros, setCadastros] = useState<CadastroRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [selected, setSelected] = useState<CadastroRegistro | null>(null);
  const carregar = async () => {
    setLoading(true);
    setError("");

    const resultado = await buscarCadastros();
    if (resultado && resultado.kpis) {
      setCadastros(resultado.cadastros);
    } else {
      setCadastros([]);
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }

    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  // Busca não usa CPF (mascarado). Apenas nome e CRM.
  const filtered = cadastros.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || c.nome.toLowerCase().includes(q) || c.crm.includes(q);
    const matchStatus = statusFilter === "TODOS" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CRM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="TODOS">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="OK">Aprovado</option>
            <option value="ERRO">Rejeitado</option>
            <option value="INATIVO">Inativo</option>
          </select>
          <Button variant="outline" onClick={carregar} disabled={loading}>Atualizar</Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {error && <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <p className="font-heading font-semibold text-foreground">Nenhum cadastro encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Os dados serão carregados via integração n8n.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {["Nome", "CNPJ", "CRM", "UF", "Especialidade", "Email", "Status", "Data", "Ações"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{c.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{maskCnpj(c.cnpj)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.crm}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.ufCrm}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.especialidade}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{maskEmail(c.email)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.dataCadastro}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" onClick={() => setSelected(c)}>Ver</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{selected?.nome}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                🔒 Dados sensíveis exibidos parcialmente. Os dados completos estão na planilha oficial.
              </div>
              {Object.entries({
                CPF: maskCpf(selected.cpf),
                CNPJ: maskCnpj(selected.cnpj),
                CRM: `${selected.crm}/${selected.ufCrm}`,
                Especialidade: selected.especialidade,
                Email: maskEmail(selected.email),
                Telefone: maskTelefone(selected.telefone),
                "Razão Social": selected.razaoSocial,
                "Endereço do CNPJ": selected.enderecoCnpj,
                Vínculo: selected.vinculoCnpj,
                Testemunha: selected.nomeTestemunha,
                "RG Testemunha": maskRg(selected.rgTestemunha),
              }).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground font-medium text-right font-mono">{v}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
