import { supabase } from "@/lib/supabase";
import { EDGE_FUNCTIONS } from "@/config/api";

interface DadosCadastro {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  enderecoCnpj: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  banco: string;
  agencia: string;
  contaCorrente: string;
  vinculoCnpj: string;
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  crm: string;
  ufCrm: string;
  especialidade: string;
  email: string;
  telefone: string;
  nomeTestemunha: string;
  rgTestemunha: string;
  emailTestemunha: string;
  observacoes?: string;
}

interface ArquivosCadastro {
  arquivo_identidade: File;
  arquivo_crm: File;
  arquivo_contrato: File;
  arquivo_dados_bancarios: File;
  arquivo_rg_testemunha: File;
  arquivo_certificado_formacao: File;
  arquivo_declaracao_vinculo?: File;
  arquivo_certificado_especialidade?: File;
  arquivo_foto_3x4?: File;
  arquivo_assinatura_carimbo?: File;
}

interface DocAdicional {
  nome: string;
  arquivo: File;
}

const MEDICO_TOKEN_KEY = "medico_token";

export async function enviarCadastro(
  dados: DadosCadastro,
  arquivos: ArquivosCadastro,
  docsAdicionais: DocAdicional[] = [],
) {
  const formData = new FormData();

  formData.append("nome", dados.nomeCompleto.trim().toUpperCase());
  formData.append("cpf", dados.cpf.replace(/\D/g, ""));
  formData.append("rg", dados.rg.trim());
  formData.append("cnpj", dados.cnpj.replace(/\D/g, ""));
  formData.append("crm", dados.crm.replace(/\D/g, ""));
  formData.append("uf_crm", dados.ufCrm.toUpperCase());
  formData.append("email", dados.email.trim().toLowerCase());
  formData.append("telefone", dados.telefone.replace(/\D/g, ""));
  formData.append("especialidade", dados.especialidade.trim());
  formData.append("razao_social", dados.razaoSocial.trim());
  formData.append("data_nascimento", dados.dataNascimento);
  formData.append("endereco_cnpj", dados.enderecoCnpj.trim());
  formData.append("inscricao_municipal", dados.inscricaoMunicipal.trim());
  formData.append("inscricao_estadual", dados.inscricaoEstadual.trim());
  formData.append("banco", dados.banco.trim());
  formData.append("agencia", dados.agencia.trim());
  formData.append("conta_corrente", dados.contaCorrente.trim());
  formData.append("vinculo_cnpj", dados.vinculoCnpj);
  formData.append("nome_testemunha", dados.nomeTestemunha.trim());
  formData.append("rg_testemunha", dados.rgTestemunha.trim());
  formData.append("email_testemunha", dados.emailTestemunha.trim().toLowerCase());
  formData.append("observacoes", dados.observacoes || "");

  formData.append("arquivo_identidade", arquivos.arquivo_identidade);
  formData.append("arquivo_crm", arquivos.arquivo_crm);
  formData.append("arquivo_contrato", arquivos.arquivo_contrato);
  formData.append("arquivo_dados_bancarios", arquivos.arquivo_dados_bancarios);
  formData.append("arquivo_rg_testemunha", arquivos.arquivo_rg_testemunha);
  formData.append("arquivo_certificado_formacao", arquivos.arquivo_certificado_formacao);

  if (arquivos.arquivo_declaracao_vinculo) formData.append("arquivo_declaracao_vinculo", arquivos.arquivo_declaracao_vinculo);
  if (arquivos.arquivo_certificado_especialidade) formData.append("arquivo_certificado_especialidade", arquivos.arquivo_certificado_especialidade);
  if (arquivos.arquivo_foto_3x4) formData.append("arquivo_foto_3x4", arquivos.arquivo_foto_3x4);
  if (arquivos.arquivo_assinatura_carimbo) formData.append("arquivo_assinatura_carimbo", arquivos.arquivo_assinatura_carimbo);

  for (let i = 0; i < docsAdicionais.length; i++) {
    formData.append(`nome_doc_adicional_${i + 1}`, docsAdicionais[i].nome);
    formData.append(`arquivo_doc_adicional_${i + 1}`, docsAdicionais[i].arquivo);
  }

  const token = sessionStorage.getItem(MEDICO_TOKEN_KEY) ?? "";

  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SUBMIT_CADASTRO, {
    body: formData,
    headers: { "x-medico-token": token },
  });

  if (error) {
    // Tenta extrair mensagem do contexto da edge function
    let mensagem = "Erro ao enviar cadastro";
    try {
      const ctx: any = (error as any).context;
      if (ctx) {
        const txt = await ctx.text();
        const j = JSON.parse(txt);
        mensagem = j.error || j.mensagem || mensagem;
      }
    } catch {}
    throw new Error(mensagem);
  }

  if (!data) return { sucesso: true, id_unico: "" };
  if (typeof data === "string") {
    if (!data.trim()) return { sucesso: true, id_unico: "" };
    try { return JSON.parse(data); } catch { return { sucesso: true, id_unico: "" }; }
  }
  return data;
}
