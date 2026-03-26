export interface DadosEmpresa {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
}

export interface DadosProfissional {
  nomeCompleto: string;
  cpf: string;
  crm: string;
  ufCrm: string;
  especialidade: string;
  dataNascimento: string;
  email: string;
  telefone: string;
}

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: "corrente" | "poupanca" | "";
  chavePix: string;
}

export interface EnderecoEBancario {
  endereco: Endereco;
  bancario: DadosBancarios;
}

export interface ArquivoUpload {
  file: File | null;
  name: string;
  size: number;
  type: string;
}

export interface Documentos {
  rgCnh: ArquivoUpload | null;
  cpfDoc: ArquivoUpload | null;
  crm: ArquivoUpload | null;
  contratoSocial: ArquivoUpload | null;
  comprovanteEndereco: ArquivoUpload | null;
}

export interface CadastroCompleto {
  empresa: DadosEmpresa;
  profissional: DadosProfissional;
  enderecoEBancario: EnderecoEBancario;
  documentos: Documentos;
}

export type StatusCadastro = "PENDENTE" | "OK" | "ERRO" | "INATIVO";

export interface CadastroRegistro {
  id: string;
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
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: string;
  pix: string;
  driveLink?: string;
}

export const UFS_BRASIL = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
] as const;
