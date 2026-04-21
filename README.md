# Cadastros Médicos — Portal de Credenciamento Profissional PJ

Sistema web para credenciamento de profissionais PJ (Pessoa Jurídica), com fluxo completo de cadastro multi-etapas, upload de documentos, painel administrativo de aprovações e dashboard com insights por IA.

> **Status:** Produção
> **URL Pública:** https://cadastrosmedicos.lovable.app
> **Stack:** React 18 + Vite 5 + TypeScript 5 + Tailwind CSS v3 + shadcn/ui
> **Backend:** n8n (webhooks) + integração com Google Drive
> **Copyright:** © 2026

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitetura](#-arquitetura)
4. [Stack Técnica](#-stack-técnica)
5. [Estrutura de Pastas](#-estrutura-de-pastas)
6. [Fluxo de Cadastro (5 Etapas)](#-fluxo-de-cadastro-5-etapas)
7. [Painel Administrativo](#-painel-administrativo)
8. [Autenticação e Acessos](#-autenticação-e-acessos)
9. [Integração com n8n](#-integração-com-n8n)
10. [Identidade Visual](#-identidade-visual)
11. [Como Rodar Localmente](#-como-rodar-localmente)
12. [Deploy](#-deploy)
13. [Convenções de Código](#-convenções-de-código)
14. [Roadmap / Melhorias Futuras](#-roadmap--melhorias-futuras)

---

## 🎯 Visão Geral

O **Cadastros Médicos** é uma plataforma desenhada para padronizar e centralizar o credenciamento de profissionais da saúde que atuam como Pessoa Jurídica (PJ). O sistema é dividido em duas grandes áreas:

- **Portal do Profissional** — formulário guiado em 5 etapas para envio de dados pessoais, dados da empresa, testemunha e documentos.
- **Painel Administrativo** — área restrita para a equipe de contratos visualizar, aprovar, recusar e analisar cadastros recebidos.

Toda a persistência de dados é feita via **webhooks n8n**, que orquestram o armazenamento em planilha + upload de arquivos no Google Drive. O frontend é puramente client-side (SPA).

> ⚠️ **Importante sobre terminologia:** Ao longo de toda a aplicação, o termo **"Profissional"** é utilizado em vez de **"Médico"** quando se refere ao cadastrante (a plataforma atende diversas categorias da saúde). Os termos técnicos como `CRM`, `Especialidade Médica` e `Formação Médica` são preservados.

---

## ✨ Funcionalidades

### Para o Profissional
- ✅ Acesso via PIN (sem necessidade de cadastro prévio)
- ✅ Wizard de 5 etapas com validação por etapa
- ✅ Máscaras automáticas (CPF, CNPJ, telefone, CEP)
- ✅ Upload de múltiplos documentos (obrigatórios e opcionais)
- ✅ Tela de revisão antes do envio final
- ✅ Feedback visual de envio (loading, sucesso, erro)
- ✅ Layout responsivo (mobile-first)

### Para o Administrador
- ✅ Login com credenciais
- ✅ **Dashboard** com KPIs (total de cadastros, pendentes, aprovados, recusados)
- ✅ **Cadastros** — listagem completa com filtros e busca
- ✅ **Aprovações** — fila de pendentes com ação de aprovar/recusar
- ✅ **Documentos** — visualização dos arquivos enviados (link direto Google Drive)
- ✅ **Insights** — análises automáticas com Claude AI (Anthropic) + gráficos Recharts
- ✅ **Configurações** — área para ajustes futuros

---

## 🏗 Arquitetura

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (SPA)                        │
│   React + Vite + TypeScript + Tailwind + shadcn/ui        │
│                                                            │
│   ┌─────────────────┐         ┌──────────────────────┐    │
│   │ Portal Profis.  │         │  Painel Admin        │    │
│   │  (5 etapas)     │         │  (Dashboard, Listas) │    │
│   └────────┬────────┘         └──────────┬───────────┘    │
│            │                             │                 │
└────────────┼─────────────────────────────┼─────────────────┘
             │                             │
             ▼                             ▼
   ┌──────────────────┐          ┌──────────────────────┐
   │  Webhook n8n     │          │  Webhook n8n         │
   │  /cadastro-medico│          │  /dashboard-medicos  │
   │  /acao-cadastro  │          │                      │
   └────────┬─────────┘          └──────────┬───────────┘
            │                                │
            ▼                                ▼
   ┌─────────────────────────────────────────────────────┐
   │   n8n Workflows → Google Sheets + Google Drive      │
   └─────────────────────────────────────────────────────┘
```

A aplicação **não possui banco de dados próprio**: todos os dados são lidos/escritos via n8n, que serve como camada de orquestração e integração.

---

## 🛠 Stack Técnica

| Camada              | Tecnologia                                |
|---------------------|-------------------------------------------|
| Framework           | React 18 + Vite 5                         |
| Linguagem           | TypeScript 5                              |
| Estilização         | Tailwind CSS v3 + tokens semânticos (HSL) |
| Componentes UI      | shadcn/ui (Radix UI)                      |
| Roteamento          | React Router v6                           |
| Formulários         | React Hook Form + Zod                     |
| Estado servidor     | TanStack Query (React Query)              |
| Animações           | Framer Motion                             |
| Gráficos            | Recharts                                  |
| Notificações        | Sonner (toast)                            |
| Ícones              | lucide-react                              |
| IA                  | Claude (Anthropic API)                    |
| Backend / Integração| n8n (webhooks)                            |
| Storage de arquivos | Google Drive (via n8n)                    |
| Testes              | Vitest + Playwright                       |

---

## 📁 Estrutura de Pastas

```
src/
├── App.tsx                       # Rotas principais + Providers
├── main.tsx                      # Bootstrap React
├── index.css                     # Tokens HSL + estilos globais
│
├── components/
│   ├── auth/
│   │   └── RouteGuards.tsx       # RequireMedico, RequireAdmin
│   ├── cadastro/
│   │   ├── StepDadosEmpresa.tsx       # Etapa 1
│   │   ├── StepDadosProfissional.tsx  # Etapa 2
│   │   ├── StepTestemunha.tsx         # Etapa 3
│   │   ├── StepDocumentos.tsx         # Etapa 4
│   │   └── StepRevisao.tsx            # Etapa 5
│   ├── layout/
│   │   ├── AdminLayout.tsx       # Layout com sidebar (admin)
│   │   └── MinimalLayout.tsx     # Layout sem sidebar (wizard)
│   ├── ui/                       # Componentes shadcn/ui
│   └── NavLink.tsx
│
├── pages/
│   ├── Index.tsx                 # Landing page
│   ├── AcessoMedico.tsx          # Tela de PIN do profissional
│   ├── Cadastro.tsx              # Container do wizard 5-etapas
│   ├── LoginAdmin.tsx            # Login do administrador
│   ├── NotFound.tsx
│   └── admin/
│       ├── Dashboard.tsx         # KPIs e visão geral
│       ├── Cadastros.tsx         # Lista completa
│       ├── Aprovacoes.tsx        # Fila de aprovação
│       ├── Documentos.tsx        # Listagem de arquivos
│       ├── Insights.tsx          # Análise com IA + gráficos
│       └── Configuracoes.tsx
│
├── contexts/
│   └── AuthContext.tsx           # Estado de autenticação (admin + profissional)
│
├── services/
│   ├── cadastroService.ts        # POST do cadastro (multipart/form-data)
│   └── dashboardService.ts       # GET de cadastros e ações admin
│
├── config/
│   └── api.ts                    # URLs de webhooks + credenciais
│
├── types/
│   └── cadastro.ts               # Tipagem completa do domínio
│
├── utils/
│   ├── masks.ts                  # Máscaras (CPF, CNPJ, telefone...)
│   ├── validators.ts             # Validações (CPF, CNPJ, e-mail...)
│   └── fileUtils.ts              # Helpers de arquivo (size, type)
│
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.tsx
│
└── test/
    ├── setup.ts
    └── example.test.ts
```

---

## 📝 Fluxo de Cadastro (5 Etapas)

O profissional acessa `/acesso-medico`, informa o PIN e é redirecionado para `/cadastro`, onde percorre:

### Etapa 1 — Empresa (PJ)
- CNPJ *
- Razão Social *
- Endereço do CNPJ *
- **Inscrição Municipal** * (aceita "ISENTO")
- **Inscrição Estadual** * (aceita "ISENTO")
- **Dados Bancários da Empresa** (Banco, Agência, Conta Corrente) *
- Vínculo com o CNPJ * (Sócio / Proprietário / Contratado)

### Etapa 2 — Profissional
- Nome Completo *
- CPF *
- **RG *** (Documento de Identidade — RG, CNH ou RNE)
- Data de Nascimento *
- CRM * + UF do CRM *
- Especialidade Médica *
- E-mail * + Telefone *

### Etapa 3 — Testemunha
- Nome da Testemunha *
- RG da Testemunha *
- E-mail da Testemunha *

### Etapa 4 — Documentos

**Obrigatórios** (borda tracejada verde escuro):
- 📄 RG / CPF ou CNH do Profissional (`arquivo_identidade`)
- 📄 Comprovante do CRM (`arquivo_crm`)
- 📄 Contrato Social da Empresa (`arquivo_contrato`)
- 📄 Comprovante de Dados Bancários (`arquivo_dados_bancarios`)
- 📄 RG da Testemunha (`arquivo_rg_testemunha`)
- 📄 Declaração de Vínculo (`arquivo_declaracao_vinculo`)
- 📄 **Certificado de Formação** (`arquivo_certificado_formacao`)

**Opcionais** (borda tracejada cinza, badge "Opcional"):
- 📎 Certificado de Especialidade (RQE/Diploma)
- 📎 Foto 3x4
- 📎 Assinatura com Carimbo
- 📎 **5 pares dinâmicos** de "Documentos Adicionais" (nome + arquivo)

> **Validação dos pares adicionais:** se o nome estiver preenchido, o arquivo é obrigatório e vice-versa. Se ambos vazios, o par é ignorado no envio.

### Etapa 5 — Revisão
Exibe todos os dados preenchidos para conferência antes do envio final ao webhook.

---

## 🛡 Painel Administrativo

Acessível via `/login-admin`. Após autenticação, o admin pode navegar por:

| Rota                     | Descrição                                              |
|--------------------------|--------------------------------------------------------|
| `/admin/dashboard`       | KPIs, totais, status agregados                         |
| `/admin/cadastros`       | Tabela completa com filtro por status, busca por nome  |
| `/admin/aprovacoes`      | Fila de pendentes com ações `Aprovar` / `Recusar`      |
| `/admin/documentos`      | Lista de arquivos com link direto para o Google Drive  |
| `/admin/insights`        | Estatísticas + análise textual gerada pela Claude AI   |
| `/admin/configuracoes`   | Ajustes (placeholder)                                  |

### Ações de Aprovação
A ação dispara um POST para `WEBHOOK_ACAO` com `{ id, acao: "APROVAR" | "RECUSAR", motivo? }`. Após sucesso, a lista é atualizada via React Query.

---

## 🔐 Autenticação e Acessos

A autenticação atual é **client-side** (sessionStorage), apropriada apenas para o estágio de homologação. Credenciais ficam em `src/config/api.ts`.

### Profissional (PIN)
```
PINs válidos: 2026, 2078
```

### Administrador
```
Login: tronko          | Senha: tronko@2026
Login: admcontratos    | Senha: contratos@2026
```

> ⚠️ **Aviso de segurança:** este modelo é temporário. Para produção real, recomenda-se migrar para **Lovable Cloud** (Supabase) com autenticação real, RLS e tabela de roles separada.

---

## 🔌 Integração com n8n

Os endpoints estão centralizados em `src/config/api.ts`:

```ts
WEBHOOK_CADASTRO  → POST   multipart/form-data → cria cadastro + upload no Drive
WEBHOOK_DASHBOARD → GET    JSON → lista cadastros para o painel admin
WEBHOOK_ACAO      → POST   JSON → executa ação (aprovar/recusar)
```

### Payload de cadastro (resumo)
- Campos textuais → `formData.append("campo", valor)`
- Arquivos obrigatórios → `formData.append("arquivo_xxx", File)`
- Arquivos opcionais → enviados apenas se presentes
- Documentos adicionais → `nome_doc_adicional_N` + `arquivo_doc_adicional_N` (apenas pares completos)

---

## 🎨 Identidade Visual

Paleta oficial (definida em `src/index.css` como tokens HSL):

| Cor          | Hex       | Uso                                    |
|--------------|-----------|----------------------------------------|
| Verde Escuro | `#004E4C` | Cor primária, headers, CTAs            |
| Verde        | `#00995D` | Secundária, ações positivas            |
| Verde Limão  | `#B1D34B` | Acento, badges, destaques              |
| Bege Quente  | `#ECE3D9` | Fundos suaves, áreas de leitura        |

**Tipografia:** Inter (corpo) — sem uso de Poppins/serif.
**Componentes:** todos os componentes da pasta `ui/` seguem tokens semânticos (`bg-primary`, `text-foreground`, etc.) — **nunca cores hardcoded**.

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ ou Bun
- npm / pnpm / bun

### Instalação
```bash
# Clone o repositório
git clone <url-do-repo>
cd cadastros-medicos

# Instale as dependências
npm install
# ou
bun install

# Rode o servidor de desenvolvimento
npm run dev
# ou
bun run dev
```

A aplicação ficará disponível em `http://localhost:8080`.

### Scripts disponíveis
```bash
npm run dev         # Vite dev server
npm run build       # Build de produção
npm run preview     # Preview do build
npm run lint        # ESLint
npm run test        # Vitest
```

---

## 📦 Deploy

O deploy é feito automaticamente via **Lovable**:

- **Preview (staging):** atualizado a cada alteração na plataforma Lovable
- **Produção:** publicado em `https://cadastrosmedicos.lovable.app` via botão *Publish*

Para domínio customizado, vá em **Project → Settings → Domains** dentro do Lovable.

---

## 📐 Convenções de Código

- **Componentes:** PascalCase, um componente por arquivo
- **Hooks customizados:** prefixo `use`, em `src/hooks/`
- **Tipos:** centralizados em `src/types/`
- **Cores:** SEMPRE tokens semânticos via Tailwind, nunca classes como `bg-white` ou `text-black`
- **Formulários:** React Hook Form + Zod para validação
- **Requests:** TanStack Query para cache e estado servidor
- **Toasts:** `sonner` (não usar o toaster antigo do shadcn)
- **Imports:** alias `@/` aponta para `src/`

---

## 🗺 Roadmap / Melhorias Futuras

- [ ] Migração para **Lovable Cloud** (Supabase) com autenticação real
- [ ] Tabela `user_roles` separada com RLS para controle de acesso
- [ ] Histórico de alterações por cadastro (auditoria)
- [ ] Notificações por e-mail ao profissional (aprovação/recusa)
- [ ] Re-envio de documentos após recusa parcial
- [ ] Exportação de relatórios em PDF/CSV
- [ ] Modo escuro no painel admin
- [ ] Testes E2E com Playwright cobrindo o fluxo completo

---

## 👥 Créditos

Desenvolvido com [Lovable](https://lovable.dev) — desenvolvimento assistido por IA.

© 2026 — Todos os direitos reservados.
