import AdminLayout from "@/components/layout/AdminLayout";
import { FolderOpen } from "lucide-react";

export default function Documentos() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-bold text-lg text-foreground mb-1">Documentos</h2>
          <p className="text-sm text-muted-foreground">Módulo de documentos será habilitado após integração com Google Drive.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
