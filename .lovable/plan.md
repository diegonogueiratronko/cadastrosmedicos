# Por que o novo usuário não consegue entrar no admin

## Causa provável

O login do admin tem **duas etapas obrigatórias**:

1. **Autenticar no Supabase Auth** (`auth.users`) — email/senha.
2. **Carregar o perfil** do usuário na tabela `udc.user_profiles`, onde precisa existir uma linha com:
   - `id` = mesmo `id` do `auth.users`
   - `ativo = true`
   - `role` ∈ (`admin` | `analista`)

O `RequireAdmin` (em `src/components/auth/RouteGuards.tsx`) só libera o `/admin/*` se **ambos** `session` **e** `profile` existirem. Se o perfil não for carregado, o usuário é redirecionado de volta para `/login-admin` — exatamente o comportamento que você descreve ("não abre a página de administrador").

Quando você cria um usuário só pelo painel de Auth do Supabase, **a linha em `udc.user_profiles` não é criada automaticamente** (não há trigger configurado). Resultado: login passa, mas o app não abre o dashboard.

Outras causas possíveis (menos prováveis, mas a verificação cobre tudo):
- Linha existe mas `ativo = false` → o `AuthContext` faz `signOut()` automático (linhas 72-76 de `AuthContext.tsx`).
- O `id` da linha em `udc.user_profiles` não bate com o `id` em `auth.users`.
- Email não confirmado no Supabase Auth (a confirmação por email pode estar habilitada, bloqueando o login antes mesmo do perfil).

## O que será feito (na fase de implementação)

1. **Verificar no banco** (via migration de leitura/diagnóstico):
   - Listar `auth.users` recentes.
   - Listar `udc.user_profiles` e cruzar com `auth.users` para identificar usuários "órfãos" (sem perfil) e perfis com `ativo = false`.

2. **Corrigir o usuário recém-criado**:
   - Inserir a linha correspondente em `udc.user_profiles` com `id` igual ao do `auth.users`, `nome_completo`, `role` desejada (`admin` ou `analista`) e `ativo = true`.
   - Se o email não estiver confirmado, confirmar via SQL (`update auth.users set email_confirmed_at = now() where id = ...`).

3. **Prevenir o problema no futuro** (opcional, recomendado):
   - Criar um **trigger** `on auth.users insert` que insere automaticamente uma linha "stub" em `udc.user_profiles` (com `ativo = false` por padrão, exigindo aprovação manual de role pelo admin), **ou**
   - Construir uma tela simples em `/admin/configuracoes` para criar/ativar usuários administradores (cria no Auth + insere o perfil em uma única ação).

## Detalhes técnicos

- Arquivos relevantes (somente leitura nesta fase):
  - `src/contexts/AuthContext.tsx` (linhas 58-79: `loadProfile` exige perfil ativo)
  - `src/components/auth/RouteGuards.tsx` (linhas 17-33: `RequireAdmin` exige `session && profile`)
- Schema: `udc.user_profiles(id uuid PK → auth.users.id, nome_completo, cargo, role, ativo)`.

## Antes de implementar — preciso saber

1. **Qual o email do usuário** que você cadastrou e está com problema?
2. **Como você o cadastrou?** (a) Painel do Supabase Auth, (b) algum formulário do app, (c) SQL direto.
3. **Qual role** ele deve ter: `admin` ou `analista`?
4. Você quer apenas **corrigir esse usuário agora**, ou também quer que eu **adicione a tela/trigger** para evitar recorrência?
