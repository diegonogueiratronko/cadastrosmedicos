import { API_CONFIG } from "@/config/api";
import { CadastroRegistro } from "@/types/cadastro";

export async function fetchCadastros(): Promise<CadastroRegistro[]> {
  const res = await fetch(API_CONFIG.WEBHOOK_DASHBOARD);
  if (!res.ok) throw new Error("Erro ao buscar cadastros");
  return await res.json();
}

export interface DashboardKPIs {
  total: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

export async function fetchKPIs(): Promise<DashboardKPIs> {
  const cadastros = await fetchCadastros();
  return {
    total: cadastros.length,
    pendentes: cadastros.filter(c => c.status === "PENDENTE").length,
    aprovados: cadastros.filter(c => c.status === "OK").length,
    rejeitados: cadastros.filter(c => c.status === "ERRO").length,
  };
}
