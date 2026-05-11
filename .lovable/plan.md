# Corrigir acesso da Giovanna ao painel admin

## Diagnóstico
O usuário `giovanna.feijao.ext@unimedcnu.coop.br` foi criado no Supabase Auth, mas **não tem linha correspondente em `udc.user_profiles`**. Sem perfil ativo, o `RequireAdmin` redireciona de volta para a tela de login.

## Ação
Rodar uma migration que insere o perfil pegando o `id` direto de `auth.users` pelo email:

```sql
INSERT INTO udc.user_profiles (id, nome_completo, cargo, role, ativo)
SELECT id, 'Giovanna Feijão', 'Administradora', 'admin', true
FROM auth.users
WHERE email = 'giovanna.feijao.ext@unimedcnu.coop.br'
ON CONFLICT (id) DO UPDATE
  SET ativo = true, role = 'admin';
```

Também garantir que o email esteja confirmado (caso a confirmação por email esteja ativa no projeto), para evitar bloqueio no `signInWithPassword`:

```sql
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'giovanna.feijao.ext@unimedcnu.coop.br';
```

## Escopo
- **NÃO** mexer em código frontend.
- **NÃO** alterar fluxos de aprovação, dashboard, layout ou webhooks.
- Apenas a migration acima.

## Validação
Após a migration, peço para a Giovanna tentar logar novamente em `/login-admin` com a senha definida no painel do Supabase. Se ainda falhar, o motivo provável é senha incorreta — basta resetar pelo painel do Supabase.
