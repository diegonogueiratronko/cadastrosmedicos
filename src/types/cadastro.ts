export interface DadosEmpresa {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  enderecoCnpj: string;
  vinculoCnpj: "Sócio" | "Proprietário" | "Contratado" | "";
}

export interface DadosProfissional {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  crm: string;
  ufCrm: string;
  especialidade: string;
  email: string;
  telefone: string;
}

export interface DadosTestemunha {
  nomeTestemunha: string;
  rgTestemunha: string;
  emailTestemunha: string;
}

export interface ArquivoUpload {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface Documentos {
  arquivoRg: ArquivoUpload | null;
  arquivoCpf: ArquivoUpload | null;
  arquivoCrm: ArquivoUpload | null;
  arquivoContrato: ArquivoUpload | null;
  arquivoDadosBancarios: ArquivoUpload | null;
  arquivoRgTestemunha: ArquivoUpload | null;
  arquivoDeclaracaoVinculo: ArquivoUpload | null;
}

export interface CadastroCompleto {
  empresa: DadosEmpresa;
  profissional: DadosProfissional;
  testemunha: DadosTestemunha;
  documentos: Documentos;
}

export type StatusCadastro = "PENDENTE" | "OK" | "ERRO" | "INATIVO";

export interface CadastroRegistro {
  id: string;
  idUnico: string;
  nome: string;
  cpf: string;
  cnpj: string;
  crm: string;
  ufCrm: string;
  especialidade: string;
  email: string;
  telefone: string;
  status: StatusCadastro;
  dataCadastro: string;
  razaoSocial: string;
  nomeFantasia: string;
  dataNascimento: string;
  enderecoCnpj: string;
  vinculoCnpj: string;
  nomeTestemunha: string;
  rgTestemunha: string;
  emailTestemunha: string;
  observacoes: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoConta?: string;
  pix?: string;
  driveLink?: string;
  pastaDriveId?: string;
  pastaDriveUrl?: string;
  tipoOperacao?: string;
  dataInativacao?: string;
  motivoInativacao?: string;
}

export const UFS_BRASIL = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
] as const;
