import { UseFormReturn } from "react-hook-form";
import { DadosTestemunha, ArquivoUpload } from "@/types/cadastro";
import { Input } from "@/components/ui/input";
import { Upload, Check, FileText } from "lucide-react";
import { validateFile, formatFileSize } from "@/utils/fileUtils";
import { toast } from "sonner";

interface Props {
  form: UseFormReturn<DadosTestemunha>;
  rgTestemunhaFile: ArquivoUpload | null;
  onRgTestemunhaChange: (file: ArquivoUpload | null) => void;
}

export default function StepTestemunha({ form, rgTestemunhaFile, onRgTestemunhaChange }: Props) {
  const { register, formState: { errors } } = form;

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }
    onRgTestemunhaChange({ file, name: file.name, size: file.size, type: file.type });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="font-heading font-bold text-lg text-foreground">Dados da Testemunha</h2>
        <p className="text-sm text-muted-foreground">Informe os dados da testemunha do contrato</p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Nome da Testemunha <span className="text-destructive">*</span></label>
        <Input {...register("nomeTestemunha")} placeholder="Nome completo da testemunha" />
        {errors.nomeTestemunha && <p className="text-sm text-destructive mt-1">{errors.nomeTestemunha.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">RG da Testemunha <span className="text-destructive">*</span></label>
          <Input {...register("rgTestemunha")} placeholder="Número do RG" />
          {errors.rgTestemunha && <p className="text-sm text-destructive mt-1">{errors.rgTestemunha.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Email da Testemunha <span className="text-destructive">*</span></label>
          <Input type="email" {...register("emailTestemunha")} placeholder="email@exemplo.com" />
          {errors.emailTestemunha && <p className="text-sm text-destructive mt-1">{errors.emailTestemunha.message}</p>}
        </div>
      </div>

      <div className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
        rgTestemunhaFile ? "border-primary/40 bg-primary/5" : "border-border"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {rgTestemunhaFile ? (
              <Check className="w-5 h-5 text-primary" />
            ) : (
              <FileText className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">Documento de RG da Testemunha <span className="text-destructive">*</span></p>
              {rgTestemunhaFile && (
                <p className="text-xs text-muted-foreground">{rgTestemunhaFile.name} — {formatFileSize(rgTestemunhaFile.size)}</p>
              )}
            </div>
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors">
            <Upload className="w-3.5 h-3.5" />
            {rgTestemunhaFile ? "Trocar" : "Enviar"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
