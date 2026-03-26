import { API_CONFIG } from "@/config/api";
import { fileToBase64 } from "@/utils/fileUtils";
import { CadastroCompleto } from "@/types/cadastro";
import { unmask } from "@/utils/masks";

export async function enviarCadastro(dados: CadastroCompleto) {
  const { empresa, profissional, enderecoEBancario, documentos } = dados;

  const arquivos: Record<string, any> = {};

  const docMap = {
    rg_cnh: documentos.rgCnh,
    cpf_doc: documentos.cpfDoc,
    crm: documentos.crm,
    contrato_social: documentos.contratoSocial,
    comprovante_endereco: documentos.comprovanteEndereco,
  };

  for (const [key, doc] of Object.entries(docMap)) {
    if (doc?.file) {
      arquivos[key] = {
        name: doc.file.name,
        base64: await fileToBase64(doc.file),
        type: doc.file.type,
        size: doc.file.size,
      };
    }
  }

  const payload = {
    nome: profissional.nomeCompleto,
    cpf: unmask(profissional.cpf),
    cnpj: unmask(empresa.cnpj),
    crm: profissional.crm,
    uf_crm: profissional.ufCrm,
    especialidade: profissional.especialidade,
    data_nascimento: profissional.dataNascimento,
    email: profissional.email,
    telefone: unmask(profissional.telefone),
    razao_social: empresa.razaoSocial,
    nome_fantasia: empresa.nomeFantasia,
    cep: unmask(enderecoEBancario.endereco.cep),
    endereco: enderecoEBancario.endereco.logradouro,
    numero: enderecoEBancario.endereco.numero,
    complemento: enderecoEBancario.endereco.complemento,
    bairro: enderecoEBancario.endereco.bairro,
    cidade: enderecoEBancario.endereco.cidade,
    estado: enderecoEBancario.endereco.estado,
    banco: enderecoEBancario.bancario.banco,
    agencia: enderecoEBancario.bancario.agencia,
    conta: enderecoEBancario.bancario.conta,
    tipo_conta: enderecoEBancario.bancario.tipoConta,
    pix: enderecoEBancario.bancario.chavePix,
    arquivos,
  };

  const res = await fetch(API_CONFIG.WEBHOOK_CADASTRO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Erro ao enviar: ${res.status}`);
  return await res.json();
}
