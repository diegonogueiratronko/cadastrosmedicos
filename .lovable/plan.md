# Fixes de Segurança + Anonimização no Dashboard

## Resumo da experiência (o que muda para usuários)

**Equipe aprovadora:** **NADA muda na tela.** Mesmo login Supabase, mesmas telas, mesmos botões Aprovar/Rejeitar. A única diferença visual é que CPF/CNPJ/RG/banco/email/telefone vão aparecer **mascarados** (ex: `123.***.**-**`, `joao****@gmail.com`). A planilha continua com tudo aberto — ninguém perde acesso aos dados reais, só não dá pra ver pelo Lovable.

**Médicos (formulário público):** **NADA muda visualmente.** Continuam digitando o PIN normal e preenchendo o cadastro igual. A diferença é interna: o PIN agora é validado no servidor em vez de no navegador.

**Risco de quebrar:** baixo. Mudanças são em camada de transporte (proxy via Edge Function) e apresentação (mascaramento). Lógica de negócio do n8n fica intacta.

---

## Parte 1 — Edge Functions como proxy (segurança dos webhooks)

Criar 4 Edge Functions no Supabase que ficam entre o frontend e o n8n:

### 1.1 `verify-medico-pin` (público)
- Recebe `{ pin }` do frontend
- Compara com secret `MEDICO_PINS` (server-side)
- Se válido, retorna JWT curto (15min) assinado com `MEDICO_TOKEN_SECRET`
- Frontend guarda token em sessionStorage no lugar do `medico_auth=true`

### 1.2 `submit-cadastro` (valida token médico)
- Valida JWT do passo 1.1
- Recebe FormData do cadastro
- Encaminha para n8n `cadastro-medico` adicionando header `X-N8N-Secret: <N8N_SHARED_SECRET>`
- Retorna resposta do n8n ao frontend

### 1.3 `dashboard-medicos` (valida sessão Supabase admin)
- Valida JWT Supabase via `getClaims()`
- Confere `user_profiles.role IN ('admin','analista')`
- Faz GET no n8n `dashboard-medicos` com header `X-N8N-Secret`
- Retorna JSON ao frontend

### 1.4 `acao-cadastro` (valida sessão Supabase admin)
- Mesma validação de admin
- Recebe `{ numero_cadastro, id_unico, novo_status, motivo }`
- POST no n8n `acao-cadastro` com `X-N8N-Secret`

### Configuração n8n (você executa do lado n8n)
Em cada um dos 3 workflows, no nó Webhook, adicionar **Header Auth**:
- Header name: `X-N8N-Secret`
- Header value: mesmo valor do secret `N8N_SHARED_SECRET`

Se o header não bater → 401. Assim ninguém chama o webhook direto sem passar pela Edge Function.

### Secrets necessários (Lovable Cloud)
- `MEDICO_PINS` = `2026,2078`
- `MEDICO_TOKEN_SECRET` = string aleatória 32+ chars
- `N8N_SHARED_SECRET` = string aleatória 32+ chars (mesmo no n8n)

---

## Parte 2 — Limpeza de credenciais hardcoded

`src/config/api.ts`:
- ❌ Remover `ADMIN_CREDENTIALS` (já não usado, login é via Supabase)
- ❌ Remover `MEDICO_PINS` e `SENHA_MEDICO`
- ✅ Remover `WEBHOOK_*` (passam a ser chamadas das Edge Functions, não direto do browser)

`src/contexts/AuthContext.tsx`:
- `authMedico` vira `async`, chama `verify-medico-pin`, guarda token retornado em sessionStorage
- `isMedicoAuthed` agora valida que o token existe e não está expirado

`src/services/cadastroService.ts` e `dashboardService.ts`:
- Trocam `fetch(API_CONFIG.WEBHOOK_*)` por `supabase.functions.invoke(...)`
- `cadastroService` envia o token médico no body

---

## Parte 3 — Mascaramento de dados sensíveis no dashboard

Criar `src/utils/mask.ts` com funções puras de exibição:

```text
maskCpf("12345678900")     → "123.***.***-**"
maskCnpj("12345678000199") → "12.***.***/****-**"
maskRg("123456789")        → "12*******"
maskEmail("joao@x.com")    → "jo****@x.com"
maskTelefone("11999998888") → "(11) 9****-****"
maskConta("12345-6")       → "12***-*"
maskAgencia("1234")        → "1***"
```

Aplicar em **todas as telas admin que exibem dados de médico**:
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Aprovacoes.tsx`
- `src/pages/admin/Cadastros.tsx`
- `src/pages/admin/Documentos.tsx`
- `src/pages/admin/Insights.tsx`

Campos a mascarar: CPF, CNPJ, RG, RG testemunha, email, email testemunha, telefone, banco/agência/conta. Nome, especialidade, status, data e CRM ficam visíveis (CRM é técnico/público).

**Não mexer no formulário público** (`src/pages/Cadastro.tsx`) — ali o médico precisa ver o que digitou.

---

## Detalhes técnicos

### Estrutura de arquivos novos
```text
supabase/functions/
  verify-medico-pin/index.ts
  submit-cadastro/index.ts
  dashboard-medicos/index.ts
  acao-cadastro/index.ts
src/utils/mask.ts
```

### Arquivos modificados
- `src/config/api.ts` — remove tudo, vira praticamente vazio (ou deletado)
- `src/contexts/AuthContext.tsx` — `authMedico` async com Edge Function
- `src/services/cadastroService.ts` — usa `supabase.functions.invoke`
- `src/services/dashboardService.ts` — usa `supabase.functions.invoke`
- `src/pages/AcessoMedico.tsx` — `await authMedico(pin)` + estado de loading
- 5 telas admin — importam e aplicam funções de `mask.ts`

### JWT médico
- Algoritmo: HS256 com `MEDICO_TOKEN_SECRET`
- Payload: `{ sub: "medico", iat, exp }` (15min)
- Validado em `submit-cadastro` antes de chamar n8n

### Plano de rollout
1. Criar Edge Functions e secrets
2. Adicionar header check no n8n (em paralelo, aceitando os dois temporariamente seria ideal, mas se preferir cutover seco também funciona)
3. Deploy do frontend
4. Validar fluxo: PIN médico → cadastro → admin vê pendente mascarado → aprova → some da lista
5. Remover compatibilidade temporária no n8n (se usada)

### Fora de escopo
- Mudar layout/UX
- Mexer em RLS de tabelas Supabase existentes
- Alterar lógica do n8n além dos headers de auth
- Mascarar dados na planilha Google Sheets (continua tudo aberto lá)
