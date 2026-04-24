import { z } from "zod";

export function isValidCPF(value: string): boolean {
  const cpf = (value || "").replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  return rev === parseInt(cpf.charAt(10));
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = (value || "").replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (base: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(base.charAt(i)) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(cnpj.substring(0, 12), w1);
  if (d1 !== parseInt(cnpj.charAt(12))) return false;
  const d2 = calc(cnpj.substring(0, 13), w2);
  return d2 === parseInt(cnpj.charAt(13));
}

export const dadosEmpresaSchema = z.object({
  cnpj: z.string()
    .refine(v => v.replace(/\D/g, "").length === 14, "CNPJ deve ter 14 dígitos")
    .refine(isValidCNPJ, "CNPJ inválido"),
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional().default(""),
  enderecoCnpj: z.string().min(1, "Endereço do CNPJ é obrigatório"),
  inscricaoMunicipal: z.string().min(1, "Inscrição Municipal é obrigatória"),
  inscricaoEstadual: z.string().min(1, "Inscrição Estadual é obrigatória"),
  banco: z.string().min(1, "Nome do banco é obrigatório"),
  agencia: z.string().min(1, "Agência é obrigatória"),
  contaCorrente: z.string().min(1, "Conta corrente é obrigatória"),
  vinculoCnpj: z.enum(["Sócio", "Proprietário", "Contratado"], {
    errorMap: () => ({ message: "Selecione o vínculo com o CNPJ" }),
  }),
});

export const dadosProfissionalSchema = z.object({
  nomeCompleto: z.string().min(10, "Nome deve ter no mínimo 10 caracteres"),
  cpf: z.string()
    .refine(v => v.replace(/\D/g, "").length === 11, "CPF deve ter 11 dígitos")
    .refine(isValidCPF, "CPF inválido"),
  rg: z.string().min(1, "RG é obrigatório"),
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
