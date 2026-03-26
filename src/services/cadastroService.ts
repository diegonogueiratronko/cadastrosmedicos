import { API_CONFIG } from "@/config/api";

interface DadosCadastro {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  enderecoCnpj: string;
  vinculoCnpj: string;
  nomeCompleto: string;
  cpf: string;
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
  arquivo_rg: File;
  arquivo_cpf: File;
  arquivo_crm: File;
  arquivo_contrato: File;
  arquivo_dados_bancarios: File;
  arquivo_rg_testemunha: File;
  arquivo_declaracao_vinculo?: File;
}

export async function enviarCadastro(dados: DadosCadastro, arquivos: ArquivosCadastro) {
  const formData = new FormData();

  formData.append("nome", dados.nomeCompleto.trim().toUpperCase());
  formData.append("cpf", dados.cpf.replace(/\D/g, ""));
  formData.append("cnpj", dados.cnpj.replace(/\D/g, ""));
  formData.append("crm", dados.crm.replace(/\D/g, ""));
  formData.append("uf_crm", dados.ufCrm.toUpperCase());
  formData.append("email", dados.email.trim().toLowerCase());
  formData.append("telefone", dados.telefone.replace(/\D/g, ""));
  formData.append("especialidade", dados.especialidade.trim());
  formData.append("razao_social", dados.razaoSocial.trim());
  formData.append("data_nascimento", dados.dataNascimento);
  formData.append("endereco_cnpj", dados.enderecoCnpj.trim());
  formData.append("vinculo_cnpj", dados.vinculoCnpj);
  formData.append("nome_testemunha", dados.nomeTestemunha.trim());
  formData.append("rg_testemunha", dados.rgTestemunha.trim());
  formData.append("email_testemunha", dados.emailTestemunha.trim().toLowerCase());
  formData.append("observacoes", dados.observacoes || "");

  formData.append("arquivo_rg", arquivos.arquivo_rg);
  formData.append("arquivo_cpf", arquivos.arquivo_cpf);
  formData.append("arquivo_crm", arquivos.arquivo_crm);
  formData.append("arquivo_contrato", arquivos.arquivo_contrato);
  formData.append("arquivo_dados_bancarios", arquivos.arquivo_dados_bancarios);
  formData.append("arquivo_rg_testemunha", arquivos.arquivo_rg_testemunha);

  if (arquivos.arquivo_declaracao_vinculo) {
    formData.append("arquivo_declaracao_vinculo", arquivos.arquivo_declaracao_vinculo);
  }

  const response = await fetch(API_CONFIG.WEBHOOK_CADASTRO, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({ mensagem: "Erro de conexão com o servidor" }));
    throw new Error(erro.mensagem || "Erro ao enviar cadastro");
  }

  return await response.json();
}
