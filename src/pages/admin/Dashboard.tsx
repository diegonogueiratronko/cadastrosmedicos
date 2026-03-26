import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import AdminLayout from "@/components/layout/AdminLayout";
import { getKPIs, getWeeklyData, getSpecialtyData } from "@/services/dashboardService";
import { mockCadastros } from "@/services/mockData";
import { StatusCadastro } from "@/types/cadastro";

const statusColors: Record<StatusCadastro, string> = {
  PENDENTE: "bg-warning/15 text-warning",
  OK: "bg-primary/15 text-primary",
  ERRO: "bg-destructive/15 text-destructive",
  INATIVO: "bg-muted text-muted-foreground",
};

const kpiBarColors = ["bg-primary", "bg-tertiary", "bg-primary", "bg-destructive"];
const PIE_COLORS = ["#004E4C", "#00995D", "#B1D34B", "#006644", "#338855", "#99BB22", "#005544", "#44AA66"];

export default function Dashboard() {
  const kpis = getKPIs();
  const weeklyData = getWeeklyData();
  const specialtyData = getSpecialtyData();
  const recentCadastros = mockCadastros.slice(0, 5);

  const kpiCards = [
    { label: "TOTAL DE MÉDICOS", value: kpis.total, sub: "+12% este mês", icon: Users, color: "text-primary" },
    { label: "AGUARDANDO VALIDAÇÃO", value: kpis.pendentes, sub: "Média de 3 dias úteis", icon: Clock, color: "text-warning" },
    { label: "APROVADOS HOJE", value: kpis.aprovados, sub: "Meta diária atingida", icon: CheckCircle, color: "text-primary" },
    { label: "DOCUMENTOS PENDENTES", value: kpis.rejeitados, sub: "Requer atenção imediata", icon: XCircle, color: "text-destructive" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((k, i) => (
            <div key={k.label} className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <div className={`h-1 w-16 ${kpiBarColors[i]} rounded-full mb-3`} />
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className="font-heading font-bold text-3xl text-foreground mt-1">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Top Especialidades</h3>
            {specialtyData.slice(0, 4).map((s, i) => (
              <div key={s.name} className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-muted-foreground uppercase">{s.name}</span>
                  <span className="font-bold text-foreground">{s.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 2 ? 'bg-tertiary' : 'bg-secondary'}`}
                    style={{ width: `${(s.value / specialtyData[0].value) * 100}%` }}
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
                <Pie data={specialtyData.slice(0, 2)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70}>
                  {specialtyData.slice(0, 2).map((_, i) => <Cell key={i} fill={i === 0 ? "#00995D" : "#004E4C"} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-foreground">Últimos Cadastros</h3>
              <p className="text-xs text-muted-foreground">Médicos recém submetidos ao sistema</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Especialidade</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Ações</th>
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
                    <td className="px-4 py-3 text-muted-foreground">{c.dataCadastro}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>
                        {c.status === "OK" ? "APROVADO" : c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-muted-foreground hover:text-foreground">⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
