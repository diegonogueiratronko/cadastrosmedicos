import { useCallback } from "react";
import { Upload, Check, FileText } from "lucide-react";
import { Documentos, ArquivoUpload } from "@/types/cadastro";
import { validateFile, formatFileSize } from "@/utils/fileUtils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  documentos: Documentos;
  onChange: (docs: Documentos) => void;
}

type DocKey = keyof Omit<Documentos, "documentosAdicionais">;

interface DocConfig {
  key: DocKey;
  label: string;
  description?: string;
  required: boolean;
}

const requiredDocs: DocConfig[] = [
  { key: "arquivoIdentidade", label: "RG / CPF ou CNH do Profissional", description: "Documento de identidade com foto (RG, CNH ou RNE) e CPF — frente e verso visíveis", required: true },
  { key: "arquivoCrm", label: "CRM (frente e verso)", required: true },
  { key: "arquivoContrato", label: "Contrato Social da PJ", required: true },
  { key: "arquivoDadosBancarios", label: "Comprovante de Dados Bancários", required: true },
  { key: "arquivoCertificadoFormacao", label: "Certificado de Formação", description: "Diploma ou certificado da formação principal do profissional (Medicina, Psicologia, Enfermagem, etc.) — frente e verso", required: true },
];

const optionalDocs: DocConfig[] = [
  { key: "arquivoCertificadoEspecialidade", label: "Certificado de Especialidade", description: "Opcional — RQE, Diploma ou Certificado de especialização (Ortopedia, Neurologia, Neurocirurgia, etc.) — frente e verso", required: false },
  { key: "arquivoFoto3x4", label: "Foto 3x4", description: "Opcional — Foto recente do profissional, fundo branco, rosto visível", required: false },
  { key: "arquivoAssinaturaCarimbo", label: "Assinatura com Carimbo", description: "Opcional — Foto ou scan da assinatura do profissional com carimbo identificador", required: false },
];

export default function StepDocumentos({ documentos, onChange }: Props) {
  const handleFile = useCallback((key: DocKey, file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    const upload: ArquivoUpload = { file, name: file.name, size: file.size, type: file.type };
    onChange({ ...documentos, [key]: upload });
  }, [documentos, onChange]);

  const handleAdditionalFile = useCallback((index: number, file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    const upload: ArquivoUpload = { file, name: file.name, size: file.size, type: file.type };
    const updated = [...documentos.documentosAdicionais];
    updated[index] = { ...updated[index], arquivo: upload };
    onChange({ ...documentos, documentosAdicionais: updated });
  }, [documentos, onChange]);

  const handleAdditionalName = useCallback((index: number, nome: string) => {
    const updated = [...documentos.documentosAdicionais];
    updated[index] = { ...updated[index], nome };
    onChange({ ...documentos, documentosAdicionais: updated });
  }, [documentos, onChange]);

  const renderDocUpload = (config: DocConfig) => {
    const doc = documentos[config.key];
    const isRequired = config.required;

    return (
      <div
        key={config.key}
        className="rounded-lg p-4 transition-colors"
        style={{
          border: doc
            ? "2px dashed hsl(var(--primary) / 0.4)"
            : isRequired
              ? "2px dashed #004e4c"
              : "1.5px dashed #9a9a92",
          backgroundColor: doc ? "hsl(var(--primary) / 0.05)" : "transparent",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {doc ? (
              <Check className="w-5 h-5 shrink-0" style={{ color: "#004e4c" }} />
            ) : (
              <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium" style={{ color: isRequired ? "#004e4c" : "hsl(var(--foreground))" }}>
                  {config.label} {isRequired && <span className="text-destructive">*</span>}
                </p>
                {!isRequired && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#b1d34b", color: "#004e4c" }}>
                    Opcional
                  </span>
                )}
              </div>
              {config.description && (
                <p className="text-xs mt-0.5 italic" style={{ color: "#8a8a82", fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  {config.description}
                </p>
              )}
              {doc && (
                <p className="text-xs text-muted-foreground mt-0.5">{doc.name} — {formatFileSize(doc.size)}</p>
              )}
            </div>
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors shrink-0 ml-2">
            <Upload className="w-3.5 h-3.5" />
            {doc ? "Trocar" : "Enviar"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(config.key, f);
              }}
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-heading font-bold text-lg text-foreground">Upload de Documentos</h2>
      <p className="text-sm text-muted-foreground">Aceitos: PDF, JPG, PNG (máx. 5MB cada)</p>

      {/* Required documents */}
      <div className="space-y-3">
        {requiredDocs.map(renderDocUpload)}
      </div>

      {/* Optional documents */}
      <div className="space-y-3">
        {optionalDocs.map(renderDocUpload)}
      </div>

      {/* Additional documents section */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documentos Adicionais</h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#b1d34b", color: "#004e4c" }}>
            Opcional
          </span>
        </div>

        <div className="space-y-3">
          {documentos.documentosAdicionais.map((docAd, index) => {
            const hasName = docAd.nome.trim().length > 0;
            const hasFile = !!docAd.arquivo;
            const showNameWarning = hasFile && !hasName;
            const showFileWarning = hasName && !hasFile;

            return (
              <div
                key={index}
                className="rounded-lg p-4"
                style={{ border: "1.5px dashed #9a9a92" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={docAd.nome}
                      onChange={(e) => handleAdditionalName(index, e.target.value)}
                      placeholder="Ex: Currículo, Diploma de Pós-Graduação, Certificado de Curso, Outras Especializações..."
                      className="text-sm"
                    />
                    {showNameWarning && (
                      <p className="text-xs text-destructive mt-1">Informe o nome do documento adicional {index + 1}</p>
                    )}
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    {docAd.arquivo ? "Trocar" : "Enviar"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAdditionalFile(index, f);
                      }}
                    />
                  </label>
                </div>
                {docAd.arquivo && (
                  <div className="flex items-center gap-2 mt-2 ml-0">
                    <Check className="w-4 h-4" style={{ color: "#004e4c" }} />
                    <span className="text-xs text-muted-foreground">{docAd.arquivo.name} — {formatFileSize(docAd.arquivo.size)}</span>
                  </div>
                )}
                {showFileWarning && (
                  <p className="text-xs text-destructive mt-1">Anexe o documento referente a "{docAd.nome}"</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
