import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import MinimalLayout from "@/components/layout/MinimalLayout";
import { Button } from "@/components/ui/button";
import StepDadosEmpresa from "@/components/cadastro/StepDadosEmpresa";
import StepDadosProfissional from "@/components/cadastro/StepDadosProfissional";
import StepTestemunha from "@/components/cadastro/StepTestemunha";
import StepDocumentos from "@/components/cadastro/StepDocumentos";
import StepRevisao from "@/components/cadastro/StepRevisao";
import { enviarCadastro } from "@/services/cadastroService";

import { DadosEmpresa, DadosProfissional, DadosTestemunha, Documentos } from "@/types/cadastro";
import { dadosEmpresaSchema, dadosProfissionalSchema, dadosTestemunhaSchema } from "@/utils/validators";

const steps = ["Empresa", "Profissional", "Testemunha", "Documentos", "Revisão"];

export default function Cadastro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [aceite, setAceite] = useState(false);

  const empresaForm = useForm<DadosEmpresa>({
    resolver: zodResolver(dadosEmpresaSchema),
    defaultValues: { cnpj: "", razaoSocial: "", nomeFantasia: "", enderecoCnpj: "", vinculoCnpj: "" },
  });

  const profissionalForm = useForm<DadosProfissional>({
    resolver: zodResolver(dadosProfissionalSchema),
    defaultValues: { nomeCompleto: "", cpf: "", dataNascimento: "", crm: "", ufCrm: "", especialidade: "", email: "", telefone: "" },
  });

  const testemunhaForm = useForm<DadosTestemunha>({
    resolver: zodResolver(dadosTestemunhaSchema),
    defaultValues: { nomeTestemunha: "", rgTestemunha: "", emailTestemunha: "" },
  });

  const [documentos, setDocumentos] = useState<Documentos>({
    arquivoRg: null, arquivoCpf: null, arquivoCrm: null,
    arquivoContrato: null, arquivoDadosBancarios: null,
    arquivoRgTestemunha: null, arquivoDeclaracaoVinculo: null,
  });

  const vinculo = empresaForm.watch("vinculoCnpj");
  const allDocsUploaded = documentos.arquivoRg && documentos.arquivoCpf && documentos.arquivoCrm
    && documentos.arquivoContrato && documentos.arquivoDadosBancarios;

  const handleNext = async () => {
    if (step === 0) {
      const valid = await empresaForm.trigger();
      if (!valid) return;
      if (vinculo === "Contratado" && !documentos.arquivoDeclaracaoVinculo) {
        toast.error("A Declaração de Vínculo é obrigatória para contratados.");
        return;
      }
    } else if (step === 1) {
      const valid = await profissionalForm.trigger();
      if (!valid) return;
    } else if (step === 2) {
      const valid = await testemunhaForm.trigger();
      if (!valid) return;
      if (!documentos.arquivoRgTestemunha) {
        toast.error("O documento de RG da testemunha é obrigatório.");
        return;
      }
    } else if (step === 3) {
      if (!allDocsUploaded) {
        toast.error("Todos os documentos são obrigatórios.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!aceite) {
      toast.error("Você precisa aceitar a declaração.");
      return;
    }
    setSending(true);
    try {
      await enviarCadastro({
        empresa: empresaForm.getValues(),
        profissional: profissionalForm.getValues(),
        testemunha: testemunhaForm.getValues(),
        documentos,
      });
      setSent(true);
    } catch {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <MinimalLayout title="Cadastro Médico PJ" showBack={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Cadastro enviado com sucesso!</h2>
            <p className="text-muted-foreground mb-8">Seus dados foram recebidos e serão analisados em breve.</p>
            <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary-dark text-primary-foreground">
              Voltar ao início
            </Button>
          </div>
        </div>
      </MinimalLayout>
    );
  }

  return (
    <MinimalLayout title="Cadastro Médico PJ">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className="hidden sm:inline text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        {/* Steps */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          {step === 0 && (
            <StepDadosEmpresa
              form={empresaForm}
              declaracaoVinculo={documentos.arquivoDeclaracaoVinculo}
              onDeclaracaoChange={(f) => setDocumentos(d => ({ ...d, arquivoDeclaracaoVinculo: f }))}
            />
          )}
          {step === 1 && <StepDadosProfissional form={profissionalForm} />}
          {step === 2 && (
            <StepTestemunha
              form={testemunhaForm}
              rgTestemunhaFile={documentos.arquivoRgTestemunha}
              onRgTestemunhaChange={(f) => setDocumentos(d => ({ ...d, arquivoRgTestemunha: f }))}
            />
          )}
          {step === 3 && <StepDocumentos documentos={documentos} onChange={setDocumentos} />}
          {step === 4 && (
            <StepRevisao
              dados={{
                empresa: empresaForm.getValues(),
                profissional: profissionalForm.getValues(),
                testemunha: testemunhaForm.getValues(),
                documentos,
              }}
              aceite={aceite}
              onAceiteChange={setAceite}
            />
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={step === 0}>
              Anterior
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={sending || !aceite}
                className="bg-primary hover:bg-primary-dark text-primary-foreground min-w-[160px]"
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...</> : "Enviar Cadastro"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {sending && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-8 text-center shadow-lg">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="font-heading font-semibold text-foreground">Enviando cadastro...</p>
          </div>
        </div>
      )}
    </MinimalLayout>
  );
}
