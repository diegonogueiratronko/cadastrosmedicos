import { UseFormReturn } from "react-hook-form";
import { DadosProfissional, UFS_BRASIL, ESPECIALIDADES } from "@/types/cadastro";
import { Input } from "@/components/ui/input";
import { maskCPF, maskTelefone } from "@/utils/masks";

interface Props {
  form: UseFormReturn<DadosProfissional>;
}

export default function StepDadosProfissional({ form }: Props) {
  const { register, setValue, watch, formState: { errors } } = form;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-heading font-bold text-lg text-foreground">Dados do Profissional</h2>

      <div>
        <label className="text-sm font-medium text-foreground">Nome Completo <span className="text-destructive">*</span></label>
        <Input {...register("nomeCompleto")} placeholder="Nome completo do profissional" />
        {errors.nomeCompleto && <p className="text-sm text-destructive mt-1">{errors.nomeCompleto.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">CPF <span className="text-destructive">*</span></label>
          <Input
            {...register("cpf")}
            placeholder="XXX.XXX.XXX-XX"
            value={watch("cpf")}
            onChange={(e) => setValue("cpf", maskCPF(e.target.value), { shouldValidate: true })}
          />
          {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">RG <span className="text-destructive">*</span></label>
          <Input {...register("rg")} placeholder="Digite o número do RG" />
          <p className="text-xs text-muted-foreground mt-1 italic">Documento de Identidade (RG, CNH ou RNE)</p>
          {errors.rg && <p className="text-sm text-destructive mt-1">{errors.rg.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Data de Nascimento <span className="text-destructive">*</span></label>
        <Input type="date" {...register("dataNascimento")} />
        {errors.dataNascimento && <p className="text-sm text-destructive mt-1">{errors.dataNascimento.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">CRM <span className="text-destructive">*</span></label>
          <Input {...register("crm")} placeholder="Nº do CRM" maxLength={8} />
          {errors.crm && <p className="text-sm text-destructive mt-1">{errors.crm.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">UF do CRM <span className="text-destructive">*</span></label>
          <select {...register("ufCrm")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Selecione</option>
            {UFS_BRASIL.map((uf) => <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>)}
          </select>
          {errors.ufCrm && <p className="text-sm text-destructive mt-1">{errors.ufCrm.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Especialidade <span className="text-destructive">*</span></label>
          <select
            {...register("especialidade")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Selecione a especialidade</option>
            {ESPECIALIDADES.map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
          {errors.especialidade && <p className="text-sm text-destructive mt-1">{errors.especialidade.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
          <Input type="email" {...register("email")} placeholder="profissional@email.com" />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Telefone/Celular <span className="text-destructive">*</span></label>
          <Input
            {...register("telefone")}
            placeholder="(XX) XXXXX-XXXX"
            value={watch("telefone")}
            onChange={(e) => setValue("telefone", maskTelefone(e.target.value), { shouldValidate: true })}
          />
          {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>}
        </div>
      </div>
    </div>
  );
}
