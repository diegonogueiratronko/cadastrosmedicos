import { useState } from "react";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { mockCadastros } from "@/services/mockData";
import { toast } from "sonner";

export default function Aprovacoes() {
  const [cadastros, setCadastros] = useState(
    mockCadastros.filter((c) => c.status === "PENDENTE")
  );
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  const aprovar = (id: string) => {
    setCadastros((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cadastro aprovado com sucesso!");
  };

  const rejeitar = (id: string) => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo da rejeição.");
      return;
    }
    setCadastros((prev) => prev.filter((c) => c.id !== id));
    setRejeitando(null);
    setMotivo("");
    toast.success("Cadastro rejeitado.");
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <p className="text-sm text-muted-foreground">{cadastros.length} cadastro(s) pendente(s)</p>

        {cadastros.length === 0 && (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground">Nenhum cadastro pendente</p>
          </div>
        )}

        {cadastros.map((c) => (
          <div key={c.id} className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{c.nome}</h3>
                <p className="text-sm text-muted-foreground">CRM {c.crm}/{c.ufCrm} · {c.especialidade} · {c.dataCadastro}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => aprovar(c.id)} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                  <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRejeitando(rejeitando === c.id ? null : c.id)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                </Button>
              </div>
            </div>

            {/* Checklist docs */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["RG/CNH", "CPF", "CRM", "Contrato Social", "Comp. Endereço"].map((doc) => (
                <span key={doc} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                  <FileText className="w-3 h-3" /> {doc}
                </span>
              ))}
            </div>

            {rejeitando === c.id && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo da rejeição..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
                <Button size="sm" variant="destructive" onClick={() => rejeitar(c.id)}>
                  Confirmar Rejeição
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
