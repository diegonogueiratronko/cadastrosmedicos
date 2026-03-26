import { UseFormReturn } from "react-hook-form";
import { DadosEmpresa } from "@/types/cadastro";
import { Input } from "@/components/ui/input";
import { maskCNPJ } from "@/utils/masks";

interface Props {
  form: UseFormReturn<DadosEmpresa>;
}

export default function StepDadosEmpresa({ form }: Props) {
  const { register, setValue, watch, formState: { errors } } = form;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-heading font-bold text-lg text-foreground">Dados da Empresa (PJ)</h2>

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

      <div>
        <label className="text-sm font-medium text-foreground">Nome Fantasia</label>
        <Input {...register("nomeFantasia")} placeholder="Nome fantasia (opcional)" />
      </div>
    </div>
  );
}
