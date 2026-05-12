## Bugfix — Usar NUMERO_CADASTRO ao aprovar/rejeitar

### Problema
Quando um médico tem múltiplas linhas na planilha com o mesmo `ID_UNICO` (ex: rejeitada + reenvio), o n8n acaba atualizando a linha errada. Backend já foi corrigido para usar `NUMERO_CADASTRO` (sequencial por linha) como chave. Frontend precisa enviar esse campo e exibir flag de reenvio.

### Mudanças

**1. `src/types/cadastro.ts`** — adicionar campos no tipo `CadastroRegistro`:
- `numeroCadastro?: number`
- `ehReenvio?: boolean`
- `tentativasAnteriores?: number`

**2. `src/services/dashboardService.ts`**
- Estender `CadastroN8n` com `NUMERO_CADASTRO`, `_eh_reenvio`, `_tentativas_anteriores`.
- Mapear esses campos em `normalizarCadastro`.
- Atualizar assinatura de `executarAcao` para receber `numeroCadastro` e incluí-lo no payload POST:
  ```json
  {
    "numero_cadastro": 9,
    "id_unico": "...",
    "novo_status": "OK",
    "motivo": "",
    "atualizado_por": "..."
  }
  ```

**3. `src/pages/admin/Aprovacoes.tsx`**
- Passar `c.numeroCadastro` nas chamadas `executarAcao` (aprovar/rejeitar).
- Renderizar badge ao lado do nome quando `c.ehReenvio === true`:
  > 🔁 Reenvio (Nª tentativa) — onde N = `tentativasAnteriores + 1`
  
  Usando o componente `Badge` existente (variant custom amber), seguindo design tokens (não inline styles hardcoded — usar classes Tailwind com cor warning).
- Remover o `filtrarPendentes` local: a API agora já devolve só pendentes em `cadastros[]`. Renderizar tudo que vier. (A função era um filtro client-side; deixar de filtrar evita esconder linhas de reenvio que tenham status correto.)
- Ajuste no `recarregarComRetry`: como a API só traz pendentes, considerar item "confirmado" quando ele sumiu da lista. Manter a lógica de delays.

**4. Tela `/admin/cadastros`**
Pergunta: a API agora retorna só pendentes em `cadastros[]`. A tela atual filtra por status (TODOS/OK/ERRO/etc) — vai ficar sempre vazia para os outros status.

→ Ver pergunta abaixo.

### Fora de escopo
- Formulário público de cadastro
- Autenticação
- Redesign de telas
- Backend / n8n (já feito)

### Pergunta para você
A tela **/admin/cadastros** (que listava todos os status com filtro) vai ficar quebrada porque a API agora só devolve pendentes. O que prefere?

- **A)** Remover do menu lateral por enquanto (mais simples — Dashboard já mostra KPIs, "Pendentes" mostra pendentes, "Aprovados" mostra aprovados).
- **B)** Manter como está e aguardar novo endpoint do n8n para listar todos os status.
- **C)** Manter limitada apenas aos pendentes (vira duplicata da tela "Pendentes" — não recomendo).