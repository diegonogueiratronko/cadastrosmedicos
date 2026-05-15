## Diagnóstico

Testei as 4 edge functions diretamente. Todas respondem **404 NOT_FOUND**:

```
POST /functions/v1/verify-medico-pin   → 404
GET  /functions/v1/dashboard-medicos    → 404
```

Os arquivos existem no projeto e os 3 secrets (`MEDICO_PINS`, `MEDICO_TOKEN_SECRET`, `N8N_SHARED_SECRET`) estão configurados, mas o deploy não aconteceu na Lovable Cloud. Por isso:

- Login do profissional (PIN 2026) falha → "Failed to fetch"
- Dashboard de admin não carrega → também usa `functions.invoke`
- Aprovações também quebrariam ao agir sobre cadastros

## Plano (rollback cirúrgico para destravar agora)

**Objetivo:** voltar o app a funcionar imediatamente, mantendo o código seguro pronto para reativar quando as functions subirem.

### 1. Restaurar chamadas diretas ao n8n (frontend)
Reverter 3 arquivos para chamar os webhooks n8n diretamente, como estava antes:

- `src/services/dashboardService.ts` → `fetch` direto em `/webhook/dashboard-medicos`
- `src/services/cadastroService.ts` → `fetch` direto em `/webhook/cadastro-medico` e `/webhook/acao-cadastro`
- `src/contexts/AuthContext.tsx` → validação de PIN local (lista hardcoded `["2026", ...]`) como era antes

### 2. Recolocar as URLs e PIN em `src/config/api.ts`
Voltar com as constantes:
```ts
N8N_WEBHOOKS = { CADASTRO_MEDICO, DASHBOARD_MEDICOS, ACAO_CADASTRO }
MEDICO_SENHAS = ["2026", ...]
```

### 3. Manter as edge functions no repositório (não apagar)
Os arquivos em `supabase/functions/*` ficam parados. Quando o deploy for confirmado na aba Cloud → Edge Functions, fazemos o switch de volta sem reescrever nada.

### 4. Remover `src/utils/mask.ts` do dashboard? **Não.**
A máscara de CPF nas telas admin é puramente visual e não depende de função. Mantém.

## O que volta ao normal imediatamente

| Tela | Estado depois do rollback |
|---|---|
| `/acesso-medico` PIN 2026 | ✅ funciona |
| `/admin/dashboard` | ✅ carrega métricas do n8n |
| `/admin/aprovacoes` aprovar/rejeitar | ✅ funciona |
| Envio do cadastro 5-passos | ✅ funciona |

## Trade-off (importante você saber)

Voltamos ao modelo **menos seguro** que tínhamos antes:
- URLs do n8n e PIN voltam a ficar visíveis no bundle JS
- Sem header `X-N8N-Secret` no n8n (ou seja: **se você já configurou Header Auth no n8n hoje, precisa REMOVER** ou as chamadas do frontend serão rejeitadas)

Quando você quiser, podemos investigar por que as edge functions não fizeram deploy (na aba Cloud → Edge Functions normalmente aparece o motivo) e religá-las com 1 clique.

## Arquivos a editar

- `src/config/api.ts`
- `src/services/dashboardService.ts`
- `src/services/cadastroService.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/AcessoMedico.tsx` (remover `await` desnecessário, opcional)

Confirma que posso aplicar esse rollback?
