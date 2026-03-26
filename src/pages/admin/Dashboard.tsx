import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { getKPIs, getWeeklyData, getSpecialtyData } from "@/services/dashboardService";
import { mockCadastros } from "@/services/mockData";
import { StatusCadastro } from "@/types/cadastro";

const statusColors: Record<StatusCadastro, string> = {
  PENDENTE: "bg-warning/15 text-warning",
  OK: "bg-primary/15 text-primary",
  ERRO: "bg-destructive/15 text-destructive",
  INATIVO: "bg-muted text-muted-foreground",
};

const PIE_COLORS = ["#00A859", "#8B5CF6", "#EC4899", "#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#6366F1"];

export default function Dashboard() {
  const kpis = getKPIs();
  const weeklyData = getWeeklyData();
  const specialtyData = getSpecialtyData();
  const recentCadastros = mockCadastros.slice(0, 8);

  const kpiCards = [
    { label: "Total de Cadastros", value: kpis.total, icon: Users, color: "text-info" },
    { label: "Pendentes", value: kpis.pendentes, icon: Clock, color: "text-warning" },
    { label: "Aprovados", value: kpis.aprovados, icon: CheckCircle, color: "text-primary" },
    { label: "Rejeitados", value: kpis.rejeitados, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((k) => (
            <div key={k.label} className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-3">
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Cadastros por Semana</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="semana" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="cadastros" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Por Especialidade</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={specialtyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {specialtyData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold text-sm text-foreground">Últimos Cadastros</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">CRM</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Especialidade</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCadastros.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{c.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.crm}/{c.ufCrm}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.especialidade}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.dataCadastro}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>
                        {c.status}
                      </span>
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
