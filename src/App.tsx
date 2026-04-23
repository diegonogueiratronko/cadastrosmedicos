import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireMedico, RequireAdmin } from "@/components/auth/RouteGuards";

import Index from "./pages/Index";
import AcessoMedico from "./pages/AcessoMedico";
import Cadastro from "./pages/Cadastro";
import LoginAdmin from "./pages/LoginAdmin";
import Dashboard from "./pages/admin/Dashboard";
import Cadastros from "./pages/admin/Cadastros";
import Aprovacoes from "./pages/admin/Aprovacoes";
import Documentos from "./pages/admin/Documentos";
import Configuracoes from "./pages/admin/Configuracoes";
import Insights from "./pages/admin/Insights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="bottom-right" richColors duration={4000} />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/acesso-medico" element={<AcessoMedico />} />
            <Route path="/cadastro" element={<RequireMedico><Cadastro /></RequireMedico>} />
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/admin/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
            <Route path="/admin/cadastros" element={<RequireAdmin><Cadastros /></RequireAdmin>} />
            <Route path="/admin/aprovacoes" element={<RequireAdmin><Aprovacoes /></RequireAdmin>} />
            <Route path="/admin/documentos" element={<RequireAdmin><Documentos /></RequireAdmin>} />
            <Route path="/admin/insights" element={<RequireAdmin><Insights /></RequireAdmin>} />
            <Route path="/admin/configuracoes" element={<RequireAdmin><Configuracoes /></RequireAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
