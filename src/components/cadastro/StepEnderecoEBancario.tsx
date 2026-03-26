import { UseFormReturn } from "react-hook-form";
import { EnderecoEBancario, UFS_BRASIL } from "@/types/cadastro";
import { Input } from "@/components/ui/input";
import { maskCEP, unmask } from "@/utils/masks";
import { useState } from "react";

interface Props {
  form: UseFormReturn<EnderecoEBancario>;
}

export default function StepEnderecoEBancario({ form }: Props) {
  const { register, setValue, watch, formState: { errors } } = form;
  const [loadingCep, setLoadingCep] = useState(false);

  const handleCepChange = async (value: string) => {
    const masked = maskCEP(value);
    setValue("endereco.cep", masked, { shouldValidate: true });
    const digits = unmask(masked);
    if (digits.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setValue("endereco.logradouro", data.logradouro || "");
          setValue("endereco.bairro", data.bairro || "");
          setValue("endereco.cidade", data.localidade || "");
          setValue("endereco.estado", data.uf || "");
        }
      } catch { /* ignore */ }
      setLoadingCep(false);
    }
  };

  const eErrors = errors.endereco;
  const bErrors = errors.bancario;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-heading font-bold text-lg text-foreground mb-4">Endereço</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">CEP <span className="text-destructive">*</span></label>
              <Input
                placeholder="XXXXX-XXX"
                value={watch("endereco.cep")}
                onChange={(e) => handleCepChange(e.target.value)}
              />
              {loadingCep && <p className="text-xs text-muted-foreground mt-1">Buscando CEP...</p>}
              {eErrors?.cep && <p className="text-sm text-destructive mt-1">{eErrors.cep.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Logradouro <span className="text-destructive">*</span></label>
              <Input {...register("endereco.logradouro")} placeholder="Rua, Avenida..." />
              {eErrors?.logradouro && <p className="text-sm text-destructive mt-1">{eErrors.logradouro.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Número <span className="text-destructive">*</span></label>
              <Input {...register("endereco.numero")} placeholder="Nº" />
              {eErrors?.numero && <p className="text-sm text-destructive mt-1">{eErrors.numero.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Complemento</label>
              <Input {...register("endereco.complemento")} placeholder="Sala, andar..." />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Bairro <span className="text-destructive">*</span></label>
              <Input {...register("endereco.bairro")} />
              {eErrors?.bairro && <p className="text-sm text-destructive mt-1">{eErrors.bairro.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Cidade <span className="text-destructive">*</span></label>
              <Input {...register("endereco.cidade")} />
              {eErrors?.cidade && <p className="text-sm text-destructive mt-1">{eErrors.cidade.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Estado <span className="text-destructive">*</span></label>
              <select {...register("endereco.estado")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione</option>
                {UFS_BRASIL.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              {eErrors?.estado && <p className="text-sm text-destructive mt-1">{eErrors.estado.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h2 className="font-heading font-bold text-lg text-foreground mb-4">Dados Bancários</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Banco <span className="text-destructive">*</span></label>
              <Input {...register("bancario.banco")} placeholder="Nome do banco" />
              {bErrors?.banco && <p className="text-sm text-destructive mt-1">{bErrors.banco.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Agência <span className="text-destructive">*</span></label>
              <Input {...register("bancario.agencia")} placeholder="Nº da agência" />
              {bErrors?.agencia && <p className="text-sm text-destructive mt-1">{bErrors.agencia.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Conta <span className="text-destructive">*</span></label>
              <Input {...register("bancario.conta")} placeholder="Nº da conta" />
              {bErrors?.conta && <p className="text-sm text-destructive mt-1">{bErrors.conta.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Tipo de Conta <span className="text-destructive">*</span></label>
              <select {...register("bancario.tipoConta")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione</option>
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
              {bErrors?.tipoConta && <p className="text-sm text-destructive mt-1">{bErrors.tipoConta.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Chave PIX</label>
              <Input {...register("bancario.chavePix")} placeholder="CPF, email, telefone..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
