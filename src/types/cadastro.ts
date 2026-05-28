export interface DadosEmpresa {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  enderecoCnpj: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  banco: string;
  agencia: string;
  contaCorrente: string;
  vinculoCnpj: "Sócio" | "Proprietário" | "Contratado" | "";
}

export interface DadosProfissional {
  nomeCompleto: string;
  cpf: string;
  rg: string;
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

export interface DocumentoAdicional {
  nome: string;
  arquivo: ArquivoUpload | null;
}

export interface Documentos {
  arquivoIdentidade: ArquivoUpload | null;
  arquivoCrm: ArquivoUpload | null;
  arquivoContrato: ArquivoUpload | null;
  arquivoDadosBancarios: ArquivoUpload | null;
  arquivoRgTestemunha: ArquivoUpload | null;
  arquivoDeclaracaoVinculo: ArquivoUpload | null;
  arquivoCertificadoFormacao: ArquivoUpload | null;
  arquivoCertificadoEspecialidade: ArquivoUpload | null;
  arquivoFoto3x4: ArquivoUpload | null;
  arquivoAssinaturaCarimbo: ArquivoUpload | null;
  documentosAdicionais: DocumentoAdicional[];
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
  numeroCadastro?: number;
  ehReenvio?: boolean;
  tentativasAnteriores?: number;
}

export const UFS_BRASIL = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
] as const;

export const ESPECIALIDADES = [
  "Alergologia",
  "Arritmologia",
  "Avaliação Psicológica",
  "Bucomaxilo",
  "Cardiologia",
  "Cirurgia Ap. Digestivo",
  "Cirurgia Geral",
  "Cirurgia Ginecológica",
  "Cirurgia Oncológica",
  "Cirurgia Pediátrica",
  "Cirurgia Torácica",
  "Cirurgia Vascular",
  "Clínica Geral",
  "Clínica Médica",
  "Coloproctologia",
  "Coordenação",
  "Dermatologia",
  "Endocrinologia",
  "Endoscopia e Colonoscopia",
  "Enfermagem",
  "Fisioterapeuta",
  "Fisioterapia",
  "Fonoaudiologia",
  "Gastroenterologia",
  "Geriatria",
  "Gerência",
  "Ginecologia",
  "Hematologia",
  "Infectologia",
  "Mastologia",
  "Musicoterapia",
  "Neurocirurgia",
  "Neurologia",
  "Oncologia Clínica",
  "Orientação Parental",
  "Ortopedia",
  "Pediatria",
  "Proctologia",
  "Psicologia",
  "Psicomotricidade",
  "Psicopedagoga",
  "Psicopedagogia",
  "Psiquiatria",
  "Radiologista Intervencionista",
  "Responsável Técnico",
  "Reumatologia",
  "Supervisão",
  "Terapia Ocupacional",
  "Ultrassonografia",
  "Urologista",
] as const;
