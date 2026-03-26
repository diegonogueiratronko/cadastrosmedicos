import { API_CONFIG } from "@/config/api";
import { CadastroCompleto } from "@/types/cadastro";
import { unmask } from "@/utils/masks";

export async function enviarCadastro(dados: CadastroCompleto) {
  const { empresa, profissional, testemunha, documentos } = dados;

  const fd = new FormData();

  // Text fields
  fd.append("nome", profissional.nomeCompleto.trim().toUpperCase());
  fd.append("cpf", unmask(profissional.cpf));
  fd.append("cnpj", unmask(empresa.cnpj));
  fd.append("crm", profissional.crm.replace(/\D/g, ""));
  fd.append("uf_crm", profissional.ufCrm.toUpperCase());
  fd.append("email", profissional.email.trim().toLowerCase());
  fd.append("telefone", unmask(profissional.telefone));
  fd.append("especialidade", profissional.especialidade.trim());
  fd.append("razao_social", empresa.razaoSocial.trim());
  fd.append("data_nascimento", profissional.dataNascimento);
  fd.append("endereco_cnpj", empresa.enderecoCnpj.trim());
  fd.append("vinculo_cnpj", empresa.vinculoCnpj === "Contratado" ? "Contratado" : empresa.vinculoCnpj);
  fd.append("nome_testemunha", testemunha.nomeTestemunha.trim());
  fd.append("rg_testemunha", testemunha.rgTestemunha.trim());
  fd.append("email_testemunha", testemunha.emailTestemunha.trim().toLowerCase());

  // Observações — nome fantasia and any extras
  const obs: string[] = [];
  if (empresa.nomeFantasia?.trim()) obs.push(`Nome Fantasia: ${empresa.nomeFantasia.trim()}`);
  fd.append("observacoes", obs.join(" | "));

  // File fields
  const fileMap: [string, File | undefined][] = [
    ["arquivo_rg", documentos.arquivoRg?.file],
    ["arquivo_cpf", documentos.arquivoCpf?.file],
    ["arquivo_crm", documentos.arquivoCrm?.file],
    ["arquivo_contrato", documentos.arquivoContrato?.file],
    ["arquivo_dados_bancarios", documentos.arquivoDadosBancarios?.file],
    ["arquivo_rg_testemunha", documentos.arquivoRgTestemunha?.file],
  ];

  if (empresa.vinculoCnpj === "Contratado" && documentos.arquivoDeclaracaoVinculo?.file) {
    fileMap.push(["arquivo_declaracao_vinculo", documentos.arquivoDeclaracaoVinculo.file]);
  }

  for (const [key, file] of fileMap) {
    if (file) fd.append(key, file, file.name);
  }

  const res = await fetch(API_CONFIG.WEBHOOK_CADASTRO, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error(`Erro ao enviar: ${res.status}`);
  return await res.json();
}
