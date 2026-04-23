import { UseFormReturn } from "react-hook-form";
import { DadosEmpresa, ArquivoUpload } from "@/types/cadastro";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { maskCNPJ } from "@/utils/masks";
import { Upload, Check, FileText, Info } from "lucide-react";
import { validateFile, formatFileSize } from "@/utils/fileUtils";
import { toast } from "sonner";

interface Props {
  form: UseFormReturn<DadosEmpresa>;
  declaracaoVinculo: ArquivoUpload | null;
  onDeclaracaoChange: (file: ArquivoUpload | null) => void;
}

export default function StepDadosEmpresa({ form, declaracaoVinculo, onDeclaracaoChange }: Props) {
  const { register, setValue, watch, formState: { errors } } = form;
  const vinculo = watch("vinculoCnpj");

  const handleFileChange = (file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }
    onDeclaracaoChange({ file, name: file.name, size: file.size, type: file.type });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-heading font-bold text-lg text-foreground">Dados da Empresa (PJ)</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">CNPJ <span className="text-destructive">*</span></label>
          <Input
            {...register("cnpj")}
            placeholder="XX.XXX.XXX/XXXX-XX"
            value={watch("cnpj")}
            onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value), { shouldValidate: true })}
          />
          {errors.cnpj && <p className="text-sm text-destructive mt-1">{errors.cnpj.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Razão Social <span className="text-destructive">*</span></label>
          <Input {...register("razaoSocial")} placeholder="Razão social da empresa" />
          {errors.razaoSocial && <p className="text-sm text-destructive mt-1">{errors.razaoSocial.message}</p>}
        </div>
      </div>


      <div>
        <label className="text-sm font-medium text-foreground">Endereço do CNPJ <span className="text-destructive">*</span></label>
        <Textarea
          {...register("enderecoCnpj")}
          placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
          rows={2}
        />
        {errors.enderecoCnpj && <p className="text-sm text-destructive mt-1">{errors.enderecoCnpj.message}</p>}
      </div>

      {/* Inscrição Municipal */}
      <div>
        <label className="text-sm font-medium text-foreground">Inscrição Municipal <span className="text-destructive">*</span></label>
        <Input {...register("inscricaoMunicipal")} placeholder='Digite o número ou "ISENTO"' />
        <p className="text-xs text-muted-foreground mt-1 italic">Caso não possua, informe ISENTO</p>
        {errors.inscricaoMunicipal && <p className="text-sm text-destructive mt-1">{errors.inscricaoMunicipal.message}</p>}
      </div>

      {/* Inscrição Estadual */}
      <div>
        <label className="text-sm font-medium text-foreground">Inscrição Estadual <span className="text-destructive">*</span></label>
        <Input {...register("inscricaoEstadual")} placeholder='Digite o número ou "ISENTO"' />
        <p className="text-xs text-muted-foreground mt-1 italic">Caso não possua, informe ISENTO</p>
        {errors.inscricaoEstadual && <p className="text-sm text-destructive mt-1">{errors.inscricaoEstadual.message}</p>}
      </div>

      {/* Dados Bancários da Empresa */}
      <div className="pt-2">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Dados Bancários da Empresa</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nome do Banco <span className="text-destructive">*</span></label>
            <Input {...register("banco")} placeholder="Ex: Bradesco, Itaú, Caixa Econômica Federal..." />
            {errors.banco && <p className="text-sm text-destructive mt-1">{errors.banco.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Agência <span className="text-destructive">*</span></label>
              <Input {...register("agencia")} placeholder="Ex: 1234-5" />
              {errors.agencia && <p className="text-sm text-destructive mt-1">{errors.agencia.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Conta Corrente <span className="text-destructive">*</span></label>
              <Input {...register("contaCorrente")} placeholder="Ex: 98765-0" />
              {errors.contaCorrente && <p className="text-sm text-destructive mt-1">{errors.contaCorrente.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Vínculo com o CNPJ <span className="text-destructive">*</span></label>
        <select
          {...register("vinculoCnpj")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Selecione...</option>
          <option value="Sócio">Sócio</option>
          <option value="Proprietário">Proprietário</option>
          <option value="Contratado">Contratado (Declaração de Vínculo)</option>
        </select>
        {errors.vinculoCnpj && <p className="text-sm text-destructive mt-1">{errors.vinculoCnpj.message}</p>}
      </div>

      {vinculo === "Contratado" && (
        <div className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
          declaracaoVinculo ? "border-primary/40 bg-primary/5" : "border-border"
        }`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {declaracaoVinculo ? (
                <Check className="w-5 h-5 text-primary" />
              ) : (
                <FileText className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Declaração de Vínculo <span className="text-destructive">*</span></p>
                {declaracaoVinculo && (
                  <p className="text-xs text-muted-foreground">{declaracaoVinculo.name} — {formatFileSize(declaracaoVinculo.size)}</p>
                )}
              </div>
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors shrink-0">
              <Upload className="w-3.5 h-3.5" />
              {declaracaoVinculo ? "Trocar" : "Enviar"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
              />
            </label>
          </div>

          <div className="flex gap-3 rounded-md bg-accent/15 border-l-4 border-accent p-3">
            <Info className="w-4 h-4 text-accent-foreground/80 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-foreground/80">
              O documento deve constar com a logomarca da empresa e/ou papel timbrado, conter Razão Social, CNPJ da empresa citada, Nome completo do profissional, CPF e CRM do estado de atuação da contratação, e deve ser assinado pelo sócio majoritário ou sócio-administrador.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
