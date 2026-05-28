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
  const [protocolo, setProtocolo] = useState("");
  const [erroEnvio, setErroEnvio] = useState("");
  const [aceite, setAceite] = useState(false);

  const empresaForm = useForm<DadosEmpresa>({
    resolver: zodResolver(dadosEmpresaSchema),
    defaultValues: {
      cnpj: "", razaoSocial: "", nomeFantasia: "", cep: "", enderecoCnpj: "",
      inscricaoMunicipal: "", inscricaoEstadual: "",
      banco: "", agencia: "", contaCorrente: "",
      vinculoCnpj: "",
    },
  });

  const profissionalForm = useForm<DadosProfissional>({
    resolver: zodResolver(dadosProfissionalSchema),
    defaultValues: { nomeCompleto: "", cpf: "", rg: "", dataNascimento: "", crm: "", ufCrm: "", especialidade: "", email: "", telefone: "" },
  });

  const testemunhaForm = useForm<DadosTestemunha>({
    resolver: zodResolver(dadosTestemunhaSchema),
    defaultValues: { nomeTestemunha: "", rgTestemunha: "", emailTestemunha: "" },
  });

  const [documentos, setDocumentos] = useState<Documentos>({
    arquivoIdentidade: null,
    arquivoCrm: null,
    arquivoContrato: null,
    arquivoDadosBancarios: null,
    arquivoRgTestemunha: null,
    arquivoDeclaracaoVinculo: null,
    arquivoCertificadoFormacao: null,
    arquivoCertificadoEspecialidade: null,
    arquivoFoto3x4: null,
    arquivoAssinaturaCarimbo: null,
    documentosAdicionais: Array.from({ length: 5 }, () => ({ nome: "", arquivo: null })),
  });

  const vinculo = empresaForm.watch("vinculoCnpj");

  const allRequiredDocsUploaded = documentos.arquivoIdentidade && documentos.arquivoCrm
    && documentos.arquivoContrato && documentos.arquivoDadosBancarios
    && documentos.arquivoCertificadoFormacao;

  // Validate additional doc pairs
  const validateAdditionalDocs = (): string | null => {
    for (let i = 0; i < documentos.documentosAdicionais.length; i++) {
      const { nome, arquivo } = documentos.documentosAdicionais[i];
      const hasName = nome.trim().length > 0;
      const hasFile = !!arquivo;
      if (hasName && !hasFile) return `Anexe o documento referente a "${nome}"`;
      if (hasFile && !hasName) return `Informe o nome do documento adicional ${i + 1}`;
    }
    return null;
  };

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
      if (!allRequiredDocsUploaded) {
        toast.error("Todos os documentos obrigatórios são necessários.");
        return;
      }
      const adError = validateAdditionalDocs();
      if (adError) {
        toast.error(adError);
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
    setErroEnvio("");

    try {
      const empresa = empresaForm.getValues();
      const profissional = profissionalForm.getValues();
      const testemunha = testemunhaForm.getValues();

      const dados = {
        cnpj: empresa.cnpj,
        razaoSocial: empresa.razaoSocial,
        nomeFantasia: empresa.nomeFantasia || "",
        cep: empresa.cep,
        enderecoCnpj: empresa.enderecoCnpj,
        inscricaoMunicipal: empresa.inscricaoMunicipal,
        inscricaoEstadual: empresa.inscricaoEstadual,
        banco: empresa.banco,
        agencia: empresa.agencia,
        contaCorrente: empresa.contaCorrente,
        vinculoCnpj: empresa.vinculoCnpj,
        nomeCompleto: profissional.nomeCompleto,
        cpf: profissional.cpf,
        rg: profissional.rg,
        dataNascimento: profissional.dataNascimento,
        crm: profissional.crm,
        ufCrm: profissional.ufCrm,
        especialidade: profissional.especialidade,
        email: profissional.email,
        telefone: profissional.telefone,
        nomeTestemunha: testemunha.nomeTestemunha,
        rgTestemunha: testemunha.rgTestemunha,
        emailTestemunha: testemunha.emailTestemunha,
        observacoes: `Nome Fantasia: ${empresa.nomeFantasia || "N/A"}`,
      };

      const arquivos = {
        arquivo_identidade: documentos.arquivoIdentidade!.file,
        arquivo_crm: documentos.arquivoCrm!.file,
        arquivo_contrato: documentos.arquivoContrato!.file,
        arquivo_dados_bancarios: documentos.arquivoDadosBancarios!.file,
        arquivo_rg_testemunha: documentos.arquivoRgTestemunha!.file,
        arquivo_certificado_formacao: documentos.arquivoCertificadoFormacao!.file,
        arquivo_declaracao_vinculo: empresa.vinculoCnpj === "Contratado" ? documentos.arquivoDeclaracaoVinculo?.file : undefined,
        arquivo_certificado_especialidade: documentos.arquivoCertificadoEspecialidade?.file,
        arquivo_foto_3x4: documentos.arquivoFoto3x4?.file,
        arquivo_assinatura_carimbo: documentos.arquivoAssinaturaCarimbo?.file,
      };

      // Collect additional doc pairs
      const docsAdicionais: { nome: string; arquivo: File }[] = [];
      for (const docAd of documentos.documentosAdicionais) {
        if (docAd.nome.trim() && docAd.arquivo) {
          docsAdicionais.push({ nome: docAd.nome.trim(), arquivo: docAd.arquivo.file });
        }
      }

      const resultado = await enviarCadastro(dados, arquivos, docsAdicionais);

      if (resultado.sucesso === true) {
        setProtocolo(resultado.id_unico || "");
        setSent(true);
      } else {
        throw new Error(resultado.mensagem || "Erro ao enviar cadastro");
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao enviar cadastro. Tente novamente.";
      setErroEnvio(mensagem);
      toast.error(mensagem);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <MinimalLayout title="Cadastro Profissional PJ" showBack={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Cadastro enviado com sucesso!</h2>
            <p className="text-muted-foreground mb-2">Seus dados foram recebidos e serão analisados em breve.</p>
            {protocolo && <p className="text-sm font-medium text-foreground mb-8">Protocolo: {protocolo}</p>}
            <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary-dark text-primary-foreground">
              Voltar ao início
            </Button>
          </div>
        </div>
      </MinimalLayout>
    );
  }

  if (erroEnvio) {
    return (
      <MinimalLayout title="Cadastro Profissional PJ" showBack={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
          <div className="text-center animate-fade-in max-w-md">
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6">
              <h2 className="font-heading font-bold text-2xl text-destructive mb-2">Erro ao enviar cadastro</h2>
              <p className="text-sm text-foreground mb-6">{erroEnvio}</p>
              <Button onClick={() => setErroEnvio("")} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </MinimalLayout>
    );
  }

  return (
    <MinimalLayout title="Cadastro Profissional PJ">
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
            <p className="font-heading font-semibold text-foreground">Enviando cadastro e documentos...</p>
          </div>
        </div>
      )}
    </MinimalLayout>
  );
}
