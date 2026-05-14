import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, RefreshCw, Loader2, Users, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, Target, ShieldAlert, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { buscarCadastros, DashboardData } from "@/services/dashboardService";
import { CadastroRegistro } from "@/types/cadastro";
import { maskCnpj } from "@/utils/mask";

/* ── types ── */
interface Insight {
  tipo: "alerta" | "oportunidade" | "tendencia" | "risco" | "acao";
  titulo: string;
  texto: string;
}

interface Stats {
  total: number;
  pendente: number;
  ok: number;
  erro: number;
  inativo: number;
  taxaPendente: string;
  taxaAprovacao: string;
  taxaRejeicao: string;
  totalContratados: number;
  erroContratados: number;
  topEspecialidades: string;
  topEstados: string;
  cnpjsCompartilhados: number;
  ultimos7dias: number;
  ultimos30dias: number;
  especialidadesData: { nome: string; total: number }[];
  estadosData: { nome: string; total: number }[];
  vinculoData: { nome: string; total: number }[];
  cnpjsData: { razaoSocial: string; cnpj: string; total: number }[];
}

/* ── helpers ── */
function calcStats(data: DashboardData): Stats {
  const cadastros = data.cadastros;
  const total = data.kpis.total || cadastros.length;
  const pendente = data.kpis.pendente;
  const ok = data.kpis.ok;
  const erro = data.kpis.erro;
  const inativo = data.kpis.inativo;

  const pct = (v: number) => total > 0 ? ((v / total) * 100).toFixed(1) : "0";

  // Especialidades
  const espMap = new Map<string, number>();
  cadastros.forEach((c) => {
    if (c.especialidade) espMap.set(c.especialidade, (espMap.get(c.especialidade) || 0) + 1);
  });
  const especialidadesData = [...espMap.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  // Estados (UF)
  const ufMap = new Map<string, number>();
  cadastros.forEach((c) => {
    if (c.ufCrm) ufMap.set(c.ufCrm, (ufMap.get(c.ufCrm) || 0) + 1);
  });
  const estadosData = [...ufMap.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  // Vínculo
  const vincMap = new Map<string, number>();
  cadastros.forEach((c) => {
    const v = c.vinculoCnpj || "Não informado";
    vincMap.set(v, (vincMap.get(v) || 0) + 1);
  });
  const vinculoData = [...vincMap.entries()].map(([nome, total]) => ({ nome, total }));

  // Contratados com erro
  const contratados = cadastros.filter((c) => c.vinculoCnpj?.toLowerCase() === "contratado");
  const erroContratados = contratados.filter((c) => c.status === "ERRO").length;

  // CNPJs compartilhados
  const cnpjMap = new Map<string, { razaoSocial: string; cnpj: string; total: number }>();
  cadastros.forEach((c) => {
    if (!c.cnpj) return;
    const existing = cnpjMap.get(c.cnpj);
    if (existing) {
      existing.total++;
    } else {
      cnpjMap.set(c.cnpj, { razaoSocial: c.razaoSocial || c.cnpj, cnpj: c.cnpj, total: 1 });
    }
  });
  const cnpjsData = [...cnpjMap.values()].filter((c) => c.total > 1).sort((a, b) => b.total - a.total);

  // Últimos 7/30 dias
  const now = Date.now();
  const d7 = 7 * 86400000;
  const d30 = 30 * 86400000;
  const ultimos7dias = cadastros.filter((c) => c.dataCadastro && now - new Date(c.dataCadastro).getTime() < d7).length;
  const ultimos30dias = cadastros.filter((c) => c.dataCadastro && now - new Date(c.dataCadastro).getTime() < d30).length;

  return {
    total, pendente, ok, erro, inativo,
    taxaPendente: pct(pendente),
    taxaAprovacao: pct(ok),
    taxaRejeicao: pct(erro),
    totalContratados: contratados.length,
    erroContratados,
    topEspecialidades: especialidadesData.slice(0, 5).map((e) => `${e.nome}(${e.total})`).join(", "),
    topEstados: estadosData.slice(0, 5).map((e) => `${e.nome}(${e.total})`).join(", "),
    cnpjsCompartilhados: cnpjsData.length,
    ultimos7dias,
    ultimos30dias,
    especialidadesData,
    estadosData,
    vinculoData,
    cnpjsData,
  };
}

function gerarInsightsFallback(stats: Stats): Insight[] {
  const insights: Insight[] = [];
  if (stats.pendente > 0)
    insights.push({ tipo: "alerta", titulo: "Cadastros pendentes", texto: `Existem ${stats.pendente} cadastros aguardando validação (${stats.taxaPendente}% do total). Priorize a análise para não acumular fila.` });
  if (stats.erroContratados > 0)
    insights.push({ tipo: "risco", titulo: "Contratados com erro", texto: `${stats.erroContratados} médico(s) contratado(s) tiveram cadastro rejeitado. Verifique a documentação desses profissionais.` });
  if (stats.cnpjsCompartilhados > 0)
    insights.push({ tipo: "tendencia", titulo: "CNPJs compartilhados", texto: `${stats.cnpjsCompartilhados} CNPJ(s) possuem mais de um médico vinculado. Pode indicar clínicas ou cooperativas.` });
  if (Number(stats.taxaAprovacao) > 80)
    insights.push({ tipo: "oportunidade", titulo: "Alta taxa de aprovação", texto: `Taxa de aprovação de ${stats.taxaAprovacao}% indica boa qualidade nos cadastros recebidos.` });
  if (stats.total > 0)
    insights.push({ tipo: "acao", titulo: "Resumo geral", texto: `${stats.total} cadastros no sistema, ${stats.ultimos7dias} nos últimos 7 dias e ${stats.ultimos30dias} nos últimos 30 dias.` });
  return insights.slice(0, 5);
}

async function gerarInsightsIA(stats: Stats): Promise<Insight[]> {
  try {
    const prompt = `Analise estes dados de cadastros de médicos PJ e gere 5 insights estratégicos em português. Seja direto e prático. Cada insight deve ter no máximo 2 frases.

Dados:
- Total: ${stats.total} cadastros
- Pendentes: ${stats.pendente} (${stats.taxaPendente}%)
- Aprovados: ${stats.ok} (${stats.taxaAprovacao}%)
- Rejeitados: ${stats.erro} (${stats.taxaRejeicao}%)
- Contratados: ${stats.totalContratados} (${stats.erroContratados} com erro)
- Top especialidades: ${stats.topEspecialidades}
- Top estados: ${stats.topEstados}
- CNPJs com múltiplos médicos: ${stats.cnpjsCompartilhados}
- Cadastros últimos 7 dias: ${stats.ultimos7dias}
- Cadastros últimos 30 dias: ${stats.ultimos30dias}

Responda APENAS em JSON array com esta estrutura, sem markdown, sem backticks:
[{"tipo":"alerta|oportunidade|tendencia|risco|acao","titulo":"titulo curto","texto":"insight em 1-2 frases"}]`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    const text = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");
    const insights: Insight[] = JSON.parse(text.replace(/```json|```/g, "").trim());
    return insights.slice(0, 5);
  } catch {
    return gerarInsightsFallback(stats);
  }
}

/* ── insight visuals ── */
const insightConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  alerta:       { color: "text-yellow-600", bg: "bg-yellow-100", border: "border-l-yellow-500", icon: "!" },
  oportunidade: { color: "text-emerald-600", bg: "bg-emerald-100", border: "border-l-emerald-500", icon: "+" },
  tendencia:    { color: "text-blue-600", bg: "bg-blue-100", border: "border-l-blue-500", icon: "~" },
  risco:        { color: "text-red-600", bg: "bg-red-100", border: "border-l-red-500", icon: "✕" },
  acao:         { color: "text-[#8B5CF6]", bg: "bg-purple-100", border: "border-l-[#8B5CF6]", icon: "→" },
};

const CHART_COLORS = {
  roxo: "#8B5CF6",
  verde: "#00A859",
  rosa: "#EC4899",
  amarelo: "#EAB308",
  vermelho: "#DC2626",
  cinza: "#9CA3AF",
};

const vinculoColors = [CHART_COLORS.roxo, CHART_COLORS.verde, CHART_COLORS.rosa, CHART_COLORS.cinza];
const statusPieColors = [CHART_COLORS.amarelo, CHART_COLORS.verde, CHART_COLORS.vermelho, CHART_COLORS.cinza];

/* ── Component ── */
export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [loadingIA, setLoadingIA] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dashData, setDashData] = useState<DashboardData | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setLoadingIA(true);
    const resultado = await buscarCadastros();
    if (resultado && resultado.kpis) {
      setDashData(resultado);
      const s = calcStats(resultado);
      setStats(s);
      setLoading(false);
      const ia = await gerarInsightsIA(s);
      setInsights(ia);
    } else {
      setStats(null);
      setLoading(false);
    }
    setLoadingIA(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="font-heading font-bold text-lg text-foreground">Insights com IA</h2>
            <span className="text-[10px] font-bold bg-[#8B5CF6] text-white px-2 py-0.5 rounded-full">Powered by Tronko - Inovação</span>
          </div>
          <Button variant="outline" size="sm" onClick={carregar} disabled={loading || loadingIA}>
            {(loading || loadingIA) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Atualizar insights
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          ) : stats && (
            <>
              <KpiCard label="Total cadastros" value={stats.total} sub={`Últimos 7d: +${stats.ultimos7dias}`} icon={Users} accent="text-foreground" />
              <KpiCard label="Pendentes" value={stats.pendente} sub={`${stats.taxaPendente}% do total`} icon={Clock} accent="text-yellow-600" />
              <KpiCard label="Aprovados" value={stats.ok} sub={`${stats.taxaAprovacao}% aprovação`} icon={CheckCircle} accent="text-emerald-600" />
              <KpiCard label="Rejeitados" value={stats.erro} sub={`${stats.taxaRejeicao}% rejeição`} icon={XCircle} accent="text-red-600" />
            </>
          )}
        </div>

        {/* Insights Estratégicos */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <h3 className="font-heading font-semibold text-foreground">Insights estratégicos</h3>
            <span className="text-[10px] font-bold bg-[#8B5CF6] text-white px-1.5 py-0.5 rounded-full">IA</span>
          </div>
          <div className="p-5 space-y-3">
            {loadingIA ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))
            ) : insights.length > 0 ? (
              insights.map((insight, i) => {
                const cfg = insightConfig[insight.tipo] || insightConfig.acao;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border-l-[3px] ${cfg.border} bg-muted/30`}>
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{insight.titulo}</p>
                      <p className="text-sm text-muted-foreground">{insight.texto}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum dado disponível para gerar insights.</p>
            )}
          </div>
        </div>

        {/* Charts */}
        {!loading && stats && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Especialidades - horizontal bar */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Cadastros por especialidade</h3>
                {stats.especialidadesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.especialidadesData.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="nome" type="category" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill={CHART_COLORS.roxo} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">Sem dados</p>}
              </div>

              {/* Estados - vertical bar */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Distribuição por estado</h3>
                {stats.estadosData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.estadosData.slice(0, 10)} margin={{ bottom: 5 }}>
                      <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill={CHART_COLORS.verde} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">Sem dados</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Vínculo donut */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Tipo de vínculo</h3>
                {stats.vinculoData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={stats.vinculoData} dataKey="total" nameKey="nome" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                        {stats.vinculoData.map((_, i) => <Cell key={i} fill={vinculoColors[i % vinculoColors.length]} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">Sem dados</p>}
              </div>

              {/* Status donut */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Status dos cadastros</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Pendentes", value: stats.pendente },
                        { name: "Aprovados", value: stats.ok },
                        { name: "Rejeitados", value: stats.erro },
                        { name: "Inativos", value: stats.inativo },
                      ].filter((d) => d.value > 0)}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    >
                      {[CHART_COLORS.amarelo, CHART_COLORS.verde, CHART_COLORS.vermelho, CHART_COLORS.cinza]
                        .slice(0, [stats.pendente, stats.ok, stats.erro, stats.inativo].filter(Boolean).length)
                        .map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CNPJs compartilhados */}
            {stats.cnpjsData.length > 0 && (
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="p-5 border-b border-border flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-foreground">CNPJs com múltiplos médicos</h3>
                  <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Monitorar</span>
                </div>
                <div className="p-5 space-y-2">
                  {stats.cnpjsData.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.razaoSocial}</p>
                        <p className="text-xs text-muted-foreground font-mono">CNPJ: {maskCnpj(c.cnpj)}</p>
                      </div>
                      <span className="text-sm font-bold text-[#8B5CF6]">{c.total} médicos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, icon: Icon, accent }: { label: string; value: number; sub: string; icon: any; accent: string }) {
  return (
    <div className="bg-secondary/30 rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <p className="font-heading font-bold text-3xl text-foreground">{value}</p>
      <p className={`text-xs mt-1 ${accent}`}>{sub}</p>
    </div>
  );
}
