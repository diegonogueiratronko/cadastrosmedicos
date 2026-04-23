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
  const { empresa, profissional, testemunha, documentos } = dados;

  const requiredDocItems = [
    { label: "RG / CPF ou CNH do Profissional", doc: documentos.arquivoIdentidade },
    { label: "CRM (frente e verso)", doc: documentos.arquivoCrm },
    { label: "Contrato Social da PJ", doc: documentos.arquivoContrato },
    { label: "Comprovante de Dados Bancários", doc: documentos.arquivoDadosBancarios },
    { label: "RG da Testemunha", doc: documentos.arquivoRgTestemunha },
    { label: "Certificado de Formação", doc: documentos.arquivoCertificadoFormacao },
    ...(empresa.vinculoCnpj === "Contratado" ? [{ label: "Declaração de Vínculo", doc: documentos.arquivoDeclaracaoVinculo }] : []),
  ];

  const optionalDocItems = [
    { label: "Certificado de Especialidade", doc: documentos.arquivoCertificadoEspecialidade },
    { label: "Foto 3x4", doc: documentos.arquivoFoto3x4 },
    { label: "Assinatura com Carimbo", doc: documentos.arquivoAssinaturaCarimbo },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-heading font-bold text-lg text-foreground">Revisão do Cadastro</h2>

      <Section title="Dados da Empresa">
        <Item label="CNPJ" value={empresa.cnpj} />
        <Item label="Razão Social" value={empresa.razaoSocial} />
        
        <Item label="Endereço do CNPJ" value={empresa.enderecoCnpj} />
        <Item label="Inscrição Municipal" value={empresa.inscricaoMunicipal} />
        <Item label="Inscrição Estadual" value={empresa.inscricaoEstadual} />
        <Item label="Banco" value={empresa.banco} />
        <Item label="Agência" value={empresa.agencia} />
        <Item label="Conta Corrente" value={empresa.contaCorrente} />
        <Item label="Vínculo" value={empresa.vinculoCnpj} />
      </Section>

      <Section title="Dados do Profissional">
        <Item label="Nome" value={profissional.nomeCompleto} />
        <Item label="CPF" value={profissional.cpf} />
        <Item label="RG" value={profissional.rg} />
        <Item label="Data de Nasc." value={profissional.dataNascimento} />
        <Item label="CRM" value={`${profissional.crm} / ${profissional.ufCrm}`} />
        <Item label="Especialidade" value={profissional.especialidade} />
        <Item label="Email" value={profissional.email} />
        <Item label="Telefone" value={profissional.telefone} />
      </Section>

      <Section title="Dados da Testemunha">
        <Item label="Nome" value={testemunha.nomeTestemunha} />
        <Item label="RG" value={testemunha.rgTestemunha} />
        <Item label="Email" value={testemunha.emailTestemunha} />
      </Section>

      <div>
        <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Documentos Obrigatórios</h3>
        <div className="space-y-2">
          {requiredDocItems.map(({ label, doc }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              {doc ? <Check className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
              <span className={doc ? "text-foreground" : "text-destructive"}>{label}</span>
              {doc && <span className="text-muted-foreground text-xs">({doc.name} — {formatFileSize(doc.size)})</span>}
            </div>
          ))}
        </div>
      </div>

      {optionalDocItems.some(({ doc }) => doc) && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Documentos Opcionais Enviados</h3>
          <div className="space-y-2">
            {optionalDocItems.filter(({ doc }) => doc).map(({ label, doc }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-foreground">{label}</span>
                <span className="text-muted-foreground text-xs">({doc!.name} — {formatFileSize(doc!.size)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional docs */}
      {documentos.documentosAdicionais.some(d => d.nome.trim() && d.arquivo) && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Documentos Adicionais</h3>
          <div className="space-y-2">
            {documentos.documentosAdicionais.filter(d => d.nome.trim() && d.arquivo).map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-foreground">{d.nome}</span>
                <span className="text-muted-foreground text-xs">({d.arquivo!.name} — {formatFileSize(d.arquivo!.size)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
