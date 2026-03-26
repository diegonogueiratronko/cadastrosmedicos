import { CadastroCompleto } from "@/types/cadastro";
import { formatFileSize } from "@/utils/fileUtils";
import { Check, FileText } from "lucide-react";

interface Props {
  dados: CadastroCompleto;
  aceite: boolean;
  onAceiteChange: (v: boolean) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-heading font-semibold text-sm text-foreground mb-2">{title}</h3>
      <div className="bg-muted/50 rounded-lg p-4 space-y-1">{children}</div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

export default function StepRevisao({ dados, aceite, onAceiteChange }: Props) {
  const { empresa, profissional, enderecoEBancario, documentos } = dados;
  const docItems = [
    { label: "RG ou CNH", doc: documentos.rgCnh },
    { label: "CPF", doc: documentos.cpfDoc },
    { label: "CRM", doc: documentos.crm },
    { label: "Contrato Social", doc: documentos.contratoSocial },
    { label: "Comprovante de Endereço", doc: documentos.comprovanteEndereco },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-heading font-bold text-lg text-foreground">Revisão do Cadastro</h2>

      <Section title="Dados da Empresa">
        <Item label="CNPJ" value={empresa.cnpj} />
        <Item label="Razão Social" value={empresa.razaoSocial} />
        <Item label="Nome Fantasia" value={empresa.nomeFantasia} />
      </Section>

      <Section title="Dados do Profissional">
        <Item label="Nome" value={profissional.nomeCompleto} />
        <Item label="CPF" value={profissional.cpf} />
        <Item label="CRM" value={`${profissional.crm} / ${profissional.ufCrm}`} />
        <Item label="Especialidade" value={profissional.especialidade} />
        <Item label="Data de Nasc." value={profissional.dataNascimento} />
        <Item label="Email" value={profissional.email} />
        <Item label="Telefone" value={profissional.telefone} />
      </Section>

      <Section title="Endereço">
        <Item label="CEP" value={enderecoEBancario.endereco.cep} />
        <Item label="Endereço" value={`${enderecoEBancario.endereco.logradouro}, ${enderecoEBancario.endereco.numero}`} />
        <Item label="Bairro" value={enderecoEBancario.endereco.bairro} />
        <Item label="Cidade/UF" value={`${enderecoEBancario.endereco.cidade} - ${enderecoEBancario.endereco.estado}`} />
      </Section>

      <Section title="Dados Bancários">
        <Item label="Banco" value={enderecoEBancario.bancario.banco} />
        <Item label="Agência" value={enderecoEBancario.bancario.agencia} />
        <Item label="Conta" value={enderecoEBancario.bancario.conta} />
        <Item label="Tipo" value={enderecoEBancario.bancario.tipoConta === "corrente" ? "Corrente" : "Poupança"} />
        <Item label="PIX" value={enderecoEBancario.bancario.chavePix} />
      </Section>

      <div>
        <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Documentos</h3>
        <div className="space-y-2">
          {docItems.map(({ label, doc }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              {doc ? <Check className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
              <span className={doc ? "text-foreground" : "text-destructive"}>{label}</span>
              {doc && <span className="text-muted-foreground text-xs">({doc.name} — {formatFileSize(doc.size)})</span>}
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg cursor-pointer">
        <input
          type="checkbox"
          checked={aceite}
          onChange={(e) => onAceiteChange(e.target.checked)}
          className="mt-0.5 rounded border-input"
        />
        <span className="text-sm text-foreground">
          Declaro que as informações prestadas são verdadeiras e assumo a responsabilidade pela sua veracidade.
        </span>
      </label>
    </div>
  );
}
