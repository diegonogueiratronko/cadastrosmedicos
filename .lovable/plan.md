## Problema

Em `src/pages/admin/Aprovacoes.tsx`, ao aprovar/rejeitar:

1. O card é removido do estado local imediatamente (otimista) ✅
2. Em paralelo, `recarregarComRetry` faz um GET no webhook do dashboard
3. **Bug:** o primeiro retry roda com `delay = 0ms` — a planilha do Google Sheets ainda não propagou a alteração, então o webhook devolve o cadastro **ainda como PENDENTE**
4. O código então executa `setCadastros(resultado.cadastros.filter(c => c.status === "PENDENTE"))`, **trazendo o card removido de volta para a tela**

Resultado: parece que o "refresh não funciona" — na verdade o refresh está acontecendo, mas com dados desatualizados que reintroduzem o card.

Existe também uma proteção fraca: o retry só sai do loop se `item.status !== "PENDENTE"`. Se a planilha demora >4s (soma dos delays atuais), o retry termina sem confirmar, mas a função final faz a remoção local — o que já estava correto. O verdadeiro vilão é o **primeiro tick com delay=0** sobrescrevendo o estado otimista.

## Correção (escopo mínimo, somente este arquivo)

Editar **apenas** `src/pages/admin/Aprovacoes.tsx`. Nenhum outro arquivo é tocado.

### Mudanças em `recarregarComRetry`

1. **Remover o tick com delay=0**. Novos delays: `[1500, 2500, 4000, 5000]` (total ~13s).
2. **Manter a lista de IDs já processados localmente** para que, mesmo que o webhook ainda devolva o item como PENDENTE em algum dos retries, ele seja filtrado fora do estado.
3. **Usar de fato o `statusEsperado`**: só considerar "confirmado" quando `item.status === statusEsperado` OU o item desaparecer.
4. Em qualquer atualização intermediária do estado, **sempre** filtrar pelos IDs já processados otimisticamente, evitando reaparições.

### Estratégia de estado

Adicionar um `useRef<Set<string>>` (`processadosRef`) que guarda os IDs já aprovados/rejeitados na sessão. A `setCadastros` proveniente do retry passa a ser:

```ts
setCadastros(
  resultado.cadastros.filter(
    (c) => c.status === "PENDENTE" && !processadosRef.current.has(c.idUnico)
  )
);
```

Assim, mesmo se o webhook devolver dados velhos, o card nunca retorna à tela. Quando o backend finalmente reflete o novo status, o filtro por status já basta — e o ID pode permanecer no Set sem dano (ele será removido naturalmente do payload em fetches futuros).

### Fluxo final esperado

1. Admin clica em Aprovar
2. POST para webhook → retorna sucesso
3. ID é adicionado ao `processadosRef`
4. Card é removido localmente (otimista) — **e nunca mais reaparece**
5. Toast de sucesso
6. Em background, retries confirmam com o backend (sem efeito visual indesejado)
7. Botão sai do estado "Aprovando..." imediatamente após a resposta da API

### O que NÃO será alterado

- `src/services/dashboardService.ts` (já está correto: `cache: no-store`, busting de URL com timestamp)
- `src/config/api.ts`
- Qualquer outro arquivo do admin, do formulário público, layout, rotas, autenticação, design system
- A lógica do botão "Rejeitar" e do textarea de motivo (somente o fluxo de remoção será corrigido, o resto permanece igual)

## Arquivos editados

- `src/pages/admin/Aprovacoes.tsx` (único arquivo)
