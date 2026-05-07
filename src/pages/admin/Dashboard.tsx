import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { buscarCadastros, DashboardData } from "@/services/dashboardService";
import { CadastroRegistro, StatusCadastro } from "@/types/cadastro";

const emptyData: DashboardData = {
  kpis: { total: 0, pendente: 0, ok: 0, inativo: 0, erro: 0 },
  cadastros: [],
  top_especialidades: [],
  distribuicao_vinculo: [],
  ultimos_cadastros: [],
};

const statusColors: Record<StatusCadastro, string> = {
  PENDENTE: "bg-warning/15 text-warning",
  OK: "bg-primary/15 text-primary",
  ERRO: "bg-destructive/15 text-destructive",
  INATIVO: "bg-muted text-muted-foreground",
};

const kpiBarColors = ["bg-primary", "bg-tertiary", "bg-primary", "bg-destructive"];

const escolherCadastroMaisAtual = (atual: CadastroRegistro, proximo: CadastroRegistro) => {
  const atualPendente = atual.status === "PENDENTE";
  const proximoPendente = proximo.status === "PENDENTE";

  if (atualPendente && !proximoPendente) return proximo;
  if (!atualPendente && proximoPendente) return atual;

  const dataAtual = atual.dataCadastro ? new Date(atual.dataCadastro).getTime() : 0;
  const dataProxima = proximo.dataCadastro ? new Date(proximo.dataCadastro).getTime() : 0;

  return dataProxima > dataAtual ? proximo : atual;
};

const unificarCadastros = (lista: CadastroRegistro[]) => Array.from(
  lista.reduce((mapa, cadastro) => {
    const existente = mapa.get(cadastro.idUnico);
    mapa.set(cadastro.idUnico, existente ? escolherCadastroMaisAtual(existente, cadastro) : cadastro);
    return mapa;
  }, new Map<string, CadastroRegistro>()).values()
);

const calcularKpis = (lista: CadastroRegistro[]) => ({
  total: lista.length,
  pendente: lista.filter((c) => c.status === "PENDENTE").length,
  ok: lista.filter((c) => c.status === "OK").length,
  inativo: lista.filter((c) => c.status === "INATIVO").length,
  erro: lista.filter((c) => c.status === "ERRO").length,
});

export default function Dashboard() {
  const [dados, setDados] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    const resultado = await buscarCadastros();
    if (resultado && resultado.kpis) {
      setDados(resultado);
    } else {
      setDados(emptyData);
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const cadastros = unificarCadastros(dados.cadastros);
  const kpis = cadastros.length > 0 ? calcularKpis(cadastros) : dados.kpis;

  const specialtyChartData = dados.top_especialidades.map((item) => ({ name: item.nome, value: item.total }));

  const rawRecent = dados.ultimos_cadastros.length > 0 ? dados.ultimos_cadastros : cadastros;
  const recentCadastros = unificarCadastros(rawRecent).slice(0, 5);

  const formatarData = (data: string) => {
    try {
      const d = new Date(data);
      if (isNaN(d.getTime())) return data;
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
        " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch { return data; }
  };

  const kpiCards = [
    { label: "TOTAL DE PROFISSIONAIS", value: kpis.total, sub: "Cadastros no sistema", icon: Users },
    { label: "AGUARDANDO VALIDAÇÃO", value: kpis.pendente, sub: "Pendentes de análise", icon: Clock },
    { label: "APROVADOS", value: kpis.ok, sub: "Cadastros finalizados", icon: CheckCircle },
    { label: "REJEITADOS", value: kpis.erro, sub: "Requer atenção", icon: XCircle },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header actions */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Atualizar
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((k, i) => (
            <div key={k.label} className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <div className={`h-1 w-16 ${kpiBarColors[i]} rounded-full mb-3`} />
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className="font-heading font-bold text-3xl text-foreground mt-1">
                {loading ? "—" : k.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {!loading && cadastros.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Top Especialidades</h3>
              {specialtyChartData.slice(0, 4).map((s, i) => (
                <div key={s.name} className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground uppercase">{s.name}</span>
                    <span className="font-bold text-foreground">{s.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 2 ? 'bg-tertiary' : 'bg-secondary'}`}
                      style={{ width: `${(s.value / (specialtyChartData[0]?.value || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-1">Por Status</h3>
              <p className="text-xs text-muted-foreground mb-4">Processamento de fluxos</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Aprovados", value: kpis.ok || 0 },
                      { name: "Pendentes", value: kpis.pendente || 0 },
                      { name: "Rejeitados", value: kpis.erro || 0 },
                    ].filter(d => d.value > 0)}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                  >
                    <Cell fill="#00995D" />
                    <Cell fill="#B1D34B" />
                    <Cell fill="#cc3333" />
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && cadastros.length === 0 && !error && (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground">Nenhum cadastro encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Os dados serão carregados via integração n8n.</p>
          </div>
        )}

        {/* Recent table */}
        {!loading && recentCadastros.length > 0 && (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground">Últimos Cadastros</h3>
              <p className="text-xs text-muted-foreground">Profissionais recém submetidos ao sistema</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Especialidade</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Data Cadastro</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCadastros.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-xs font-bold text-secondary">
                            {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <span className="font-medium text-foreground">{c.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.especialidade}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatarData(c.dataCadastro)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>
                          {c.status === "OK" ? "APROVADO" : c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
