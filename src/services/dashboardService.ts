import { API_CONFIG } from "@/config/api";
import { CadastroRegistro, StatusCadastro } from "@/types/cadastro";

interface DashboardKpis {
  total: number;
  pendente: number;
  ok: number;
  inativo: number;
  erro: number;
}

interface DashboardAgrupamento {
  nome: string;
  total: number;
}

interface CadastroN8n {
  ID_UNICO?: string;
  NOME?: string;
  CPF?: string;
  CNPJ?: string;
  CRM?: string;
  UF_CRM?: string;
  EMAIL?: string;
  TELEFONE?: string;
  ESPECIALIDADE?: string;
  RAZAO_SOCIAL?: string;
  DATA_NASCIMENTO?: string;
  ENDERECO_CNPJ?: string;
  VINCULO_CNPJ?: string;
  NOME_TESTEMUNHA?: string;
  RG_TESTEMUNHA?: string;
  EMAIL_TESTEMUNHA?: string;
  STATUS?: string;
  DATA_CADASTRO?: string;
  PASTA_DRIVE_ID?: string;
  PASTA_DRIVE_URL?: string;
  TIPO_OPERACAO?: string;
  DATA_INATIVACAO?: string;
  MOTIVO_INATIVACAO?: string;
  OBSERVACOES?: string;
  NOME_FANTASIA?: string;
  NUMERO_CADASTRO?: number;
  _eh_reenvio?: boolean;
  _tentativas_anteriores?: number;
}

interface DashboardResponseN8n {
  kpis?: Partial<DashboardKpis>;
  cadastros?: CadastroN8n[];
  top_especialidades?: DashboardAgrupamento[];
  distribuicao_vinculo?: DashboardAgrupamento[];
  ultimos_cadastros?: CadastroN8n[];
}

export interface DashboardData {
  kpis: DashboardKpis;
  cadastros: CadastroRegistro[];
  top_especialidades: DashboardAgrupamento[];
  distribuicao_vinculo: DashboardAgrupamento[];
  ultimos_cadastros: CadastroRegistro[];
}

function normalizarStatus(status?: string): StatusCadastro {
  if (status === "OK" || status === "ERRO" || status === "INATIVO") return status;
  return "PENDENTE";
}

function normalizarCadastro(item: CadastroN8n): CadastroRegistro {
  return {
    id: item.ID_UNICO || "",
    idUnico: item.ID_UNICO || "",
    nome: item.NOME || "",
    cpf: item.CPF || "",
    cnpj: item.CNPJ || "",
    crm: item.CRM || "",
    ufCrm: item.UF_CRM || "",
    especialidade: item.ESPECIALIDADE || "",
    email: item.EMAIL || "",
    telefone: item.TELEFONE || "",
    status: normalizarStatus(item.STATUS),
    dataCadastro: item.DATA_CADASTRO || "",
    razaoSocial: item.RAZAO_SOCIAL || "",
    nomeFantasia: item.NOME_FANTASIA || "",
    dataNascimento: item.DATA_NASCIMENTO || "",
    enderecoCnpj: item.ENDERECO_CNPJ || "",
    vinculoCnpj: item.VINCULO_CNPJ || "",
    nomeTestemunha: item.NOME_TESTEMUNHA || "",
    rgTestemunha: item.RG_TESTEMUNHA || "",
    emailTestemunha: item.EMAIL_TESTEMUNHA || "",
    observacoes: item.OBSERVACOES || "",
    pastaDriveId: item.PASTA_DRIVE_ID,
    pastaDriveUrl: item.PASTA_DRIVE_URL,
    tipoOperacao: item.TIPO_OPERACAO,
    dataInativacao: item.DATA_INATIVACAO,
    motivoInativacao: item.MOTIVO_INATIVACAO,
  };
}

export async function buscarCadastros(): Promise<DashboardData | null> {
  try {
    const url = `${API_CONFIG.WEBHOOK_DASHBOARD}?t=${Date.now()}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });

    if (!response.ok) throw new Error("Falha ao buscar dados");

    const text = await response.text();
    if (!text || text.trim() === "") {
      console.warn("Webhook retornou resposta vazia — sem cadastros ainda.");
      return {
        kpis: { total: 0, pendente: 0, ok: 0, inativo: 0, erro: 0 },
        cadastros: [],
        top_especialidades: [],
        distribuicao_vinculo: [],
        ultimos_cadastros: [],
      };
    }

    const data = JSON.parse(text) as DashboardResponseN8n;

    return {
      kpis: {
        total: data.kpis?.total ?? 0,
        pendente: data.kpis?.pendente ?? 0,
        ok: data.kpis?.ok ?? 0,
        inativo: data.kpis?.inativo ?? 0,
        erro: data.kpis?.erro ?? 0,
      },
      cadastros: Array.isArray(data.cadastros) ? data.cadastros.map(normalizarCadastro) : [],
      top_especialidades: Array.isArray(data.top_especialidades) ? data.top_especialidades : [],
      distribuicao_vinculo: Array.isArray(data.distribuicao_vinculo) ? data.distribuicao_vinculo : [],
      ultimos_cadastros: Array.isArray(data.ultimos_cadastros) ? data.ultimos_cadastros.map(normalizarCadastro) : [],
    };
  } catch (error) {
    console.error("Erro ao buscar cadastros:", error);
    return null;
  }
}

export async function executarAcao(
  idUnico: string,
  novoStatus: string,
  motivo: string,
  atualizadoPor: string,
  numeroCadastro?: number,
) {
  const response = await fetch(API_CONFIG.WEBHOOK_ACAO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numero_cadastro: numeroCadastro,
      id_unico: idUnico,
      novo_status: novoStatus,
      motivo,
      atualizado_por: atualizadoPor,
    }),
  });

  if (!response.ok) {
    const erro = await response.text();
    let msg = "Erro ao atualizar status";
    try { msg = JSON.parse(erro).mensagem || msg; } catch {}
    throw new Error(msg);
  }

  const text = await response.text();
  if (!text) return { sucesso: true };
  try { return JSON.parse(text); } catch { return { sucesso: true }; }
}
