import { API_CONFIG } from "@/config/api";
import { CadastroRegistro } from "@/types/cadastro";
import { mockCadastros, mockKPIs, mockWeeklyData, mockSpecialtyData } from "./mockData";

export async function fetchCadastros(): Promise<CadastroRegistro[]> {
  try {
    const res = await fetch(API_CONFIG.WEBHOOK_DASHBOARD);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return mockCadastros;
  }
}

export function getKPIs() {
  return mockKPIs;
}

export function getWeeklyData() {
  return mockWeeklyData;
}

export function getSpecialtyData() {
  return mockSpecialtyData;
}
