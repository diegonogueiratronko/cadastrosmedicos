import AdminLayout from "@/components/layout/AdminLayout";
import { Settings } from "lucide-react";

export default function Configuracoes() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-bold text-lg text-foreground mb-1">Configurações</h2>
          <p className="text-sm text-muted-foreground">Módulo de configurações em desenvolvimento.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
