import { CadastroRegistro, StatusCadastro } from "@/types/cadastro";

const nomes = [
  "Dr. Carlos Eduardo Silva", "Dra. Ana Beatriz Oliveira", "Dr. Marcos Henrique Costa",
  "Dra. Juliana Ferreira", "Dr. Ricardo Almeida", "Dra. Patrícia Santos",
  "Dr. Fernando Rodrigues", "Dra. Camila Araújo", "Dr. Lucas Barbosa",
  "Dra. Isabela Mendes", "Dr. Thiago Pereira", "Dra. Mariana Cardoso",
  "Dr. Gabriel Souza", "Dra. Larissa Gomes", "Dr. Bruno Nascimento",
  "Dra. Fernanda Lima", "Dr. André Moreira", "Dra. Beatriz Carvalho",
];

const especialidades = [
  "Cardiologia", "Ortopedia", "Pediatria", "Dermatologia",
  "Ginecologia", "Neurologia", "Oftalmologia", "Clínica Geral",
];

const ufs = ["CE", "SP", "RJ", "MG", "BA", "PE", "RS", "PR"];

const statusDist: StatusCadastro[] = [
  "PENDENTE","PENDENTE","PENDENTE","PENDENTE","PENDENTE","PENDENTE",
  "PENDENTE","PENDENTE","PENDENTE","PENDENTE","PENDENTE","PENDENTE",
  "OK","OK","OK","OK","OK",
  "ERRO","ERRO",
  "INATIVO",
];

function randomDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * days));
  return d.toISOString().split("T")[0];
}

function randomDigits(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

export const mockCadastros: CadastroRegistro[] = nomes.map((nome, i) => ({
  id: `cad-${i + 1}`,
  nome,
  cpf: randomDigits(11),
  cnpj: randomDigits(14),
  crm: randomDigits(5 + (i % 2)),
  ufCrm: ufs[i % ufs.length],
  especialidade: especialidades[i % especialidades.length],
  email: `medico${i + 1}@email.com`,
  telefone: `85${randomDigits(9)}`,
  status: statusDist[i % statusDist.length],
  dataCadastro: randomDate(30),
  razaoSocial: `Clínica ${nome.split(" ").slice(-1)[0]} LTDA`,
  nomeFantasia: `Clínica ${nome.split(" ").slice(-1)[0]}`,
  dataNascimento: `19${70 + (i % 20)}-0${(i % 9) + 1}-${10 + (i % 18)}`,
  cep: `60${randomDigits(6)}`,
  endereco: `Rua ${nome.split(" ").slice(-1)[0]}, ${100 + i}`,
  numero: `${100 + i}`,
  complemento: i % 3 === 0 ? `Sala ${i + 1}` : "",
  bairro: "Centro",
  cidade: ["Fortaleza", "São Paulo", "Rio de Janeiro", "Belo Horizonte"][i % 4],
  estado: ufs[i % ufs.length],
  banco: ["Bradesco", "Itaú", "Banco do Brasil", "Santander"][i % 4],
  agencia: randomDigits(4),
  conta: `${randomDigits(5)}-${randomDigits(1)}`,
  tipoConta: i % 2 === 0 ? "corrente" : "poupança",
  pix: `medico${i + 1}@email.com`,
}));

export const mockKPIs = {
  total: mockCadastros.length,
  pendentes: mockCadastros.filter((c) => c.status === "PENDENTE").length,
  aprovados: mockCadastros.filter((c) => c.status === "OK").length,
  rejeitados: mockCadastros.filter((c) => c.status === "ERRO").length,
};

export const mockWeeklyData = [
  { semana: "Sem 1", cadastros: 3 },
  { semana: "Sem 2", cadastros: 5 },
  { semana: "Sem 3", cadastros: 2 },
  { semana: "Sem 4", cadastros: 7 },
  { semana: "Sem 5", cadastros: 4 },
  { semana: "Sem 6", cadastros: 6 },
  { semana: "Sem 7", cadastros: 3 },
  { semana: "Sem 8", cadastros: 5 },
];

export const mockSpecialtyData = especialidades.map((esp) => ({
  name: esp,
  value: mockCadastros.filter((c) => c.especialidade === esp).length,
}));
