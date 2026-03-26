import { z } from "zod";

export const dadosEmpresaSchema = z.object({
  cnpj: z.string().refine(v => v.replace(/\D/g, "").length === 14, "CNPJ deve ter 14 dígitos"),
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional().default(""),
  enderecoCnpj: z.string().min(1, "Endereço do CNPJ é obrigatório"),
  vinculoCnpj: z.enum(["Sócio", "Proprietário", "Contratado"], {
    errorMap: () => ({ message: "Selecione o vínculo com o CNPJ" }),
  }),
});

export const dadosProfissionalSchema = z.object({
  nomeCompleto: z.string().min(10, "Nome deve ter no mínimo 10 caracteres"),
  cpf: z.string().refine(v => v.replace(/\D/g, "").length === 11, "CPF deve ter 11 dígitos"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  crm: z.string().regex(/^\d{4,8}$/, "CRM deve ter de 4 a 8 dígitos"),
  ufCrm: z.string().min(2, "Selecione a UF do CRM"),
  especialidade: z.string().min(1, "Especialidade é obrigatória"),
  email: z.string().email("Email inválido"),
  telefone: z.string().refine(v => {
    const d = v.replace(/\D/g, "");
    return d.length >= 10 && d.length <= 11;
  }, "Telefone inválido"),
});

export const dadosTestemunhaSchema = z.object({
  nomeTestemunha: z.string().min(1, "Nome da testemunha é obrigatório"),
  rgTestemunha: z.string().min(1, "RG da testemunha é obrigatório"),
  emailTestemunha: z.string().email("Email inválido"),
});
