import { z } from "zod";

export const dadosEmpresaSchema = z.object({
  cnpj: z.string().refine(v => v.replace(/\D/g, "").length === 14, "CNPJ deve ter 14 dígitos"),
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional().default(""),
});

export const dadosProfissionalSchema = z.object({
  nomeCompleto: z.string().min(10, "Nome deve ter no mínimo 10 caracteres"),
  cpf: z.string().refine(v => v.replace(/\D/g, "").length === 11, "CPF deve ter 11 dígitos"),
  crm: z.string().regex(/^\d{4,8}$/, "CRM deve ter de 4 a 8 dígitos"),
  ufCrm: z.string().min(2, "Selecione a UF do CRM"),
  especialidade: z.string().min(1, "Especialidade é obrigatória"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  email: z.string().email("Email inválido"),
  telefone: z.string().refine(v => {
    const d = v.replace(/\D/g, "");
    return d.length >= 10 && d.length <= 11;
  }, "Telefone inválido"),
});

export const enderecoEBancarioSchema = z.object({
  endereco: z.object({
    cep: z.string().refine(v => v.replace(/\D/g, "").length === 8, "CEP deve ter 8 dígitos"),
    logradouro: z.string().min(1, "Logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional().default(""),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(2, "Estado é obrigatório"),
  }),
  bancario: z.object({
    banco: z.string().min(1, "Banco é obrigatório"),
    agencia: z.string().min(1, "Agência é obrigatória"),
    conta: z.string().min(1, "Conta é obrigatória"),
    tipoConta: z.enum(["corrente", "poupanca"], { errorMap: () => ({ message: "Selecione o tipo de conta" }) }),
    chavePix: z.string().optional().default(""),
  }),
});
