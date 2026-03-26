import { useCallback } from "react";
import { Upload, Check, FileText } from "lucide-react";
import { Documentos, ArquivoUpload } from "@/types/cadastro";
import { validateFile, formatFileSize } from "@/utils/fileUtils";
import { toast } from "sonner";

interface Props {
  documentos: Documentos;
  onChange: (docs: Documentos) => void;
}

type DocKey = "arquivoRg" | "arquivoCpf" | "arquivoCrm" | "arquivoContrato" | "arquivoDadosBancarios";

const docLabels: { key: DocKey; label: string }[] = [
  { key: "arquivoRg", label: "RG ou CNH do Médico" },
  { key: "arquivoCpf", label: "CPF do Médico (documento)" },
  { key: "arquivoCrm", label: "CRM (frente e verso)" },
  { key: "arquivoContrato", label: "Contrato Social da PJ" },
  { key: "arquivoDadosBancarios", label: "Comprovante de Dados Bancários" },
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

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-heading font-bold text-lg text-foreground">Upload de Documentos</h2>
      <p className="text-sm text-muted-foreground">Aceitos: PDF, JPG, PNG (máx. 5MB cada)</p>

      <div className="space-y-3">
        {docLabels.map(({ key, label }) => {
          const doc = documentos[key];
          return (
            <div
              key={key}
              className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
                doc ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {doc ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{label} <span className="text-destructive">*</span></p>
                    {doc && (
                      <p className="text-xs text-muted-foreground">{doc.name} — {formatFileSize(doc.size)}</p>
                    )}
                  </div>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {doc ? "Trocar" : "Enviar"}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(key, f);
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
