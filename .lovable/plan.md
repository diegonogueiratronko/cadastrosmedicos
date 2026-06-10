# Corrigir login da Veronice

## Diagnóstico
O console mostra que o usuário `veronice.damasceno@unimedcnu.coop.br` foi autenticado em `auth.users` (id `6deaca38-8b8c-466b-b748-ddec3333f6f5`), mas **não existe linha correspondente em `udc.user_profiles`**. Por isso o `AuthContext` faz signOut e o login não entra.

## Solução
Inserir o perfil dela em `udc.user_profiles` usando exatamente o mesmo `id` do `auth.users`.

## SQL a executar (no SQL Editor do Supabase)

Primeiro confirmar o id (segurança):

```sql
select id, email
from auth.users
where email = 'veronice.damasceno@unimedcnu.coop.br';
```

Depois inserir o perfil:

```sql
insert into udc.user_profiles (id, nome_completo, cargo, role, ativo)
select id, 'Veronice Damasceno', null, 'analista', true
from auth.users
where email = 'veronice.damasceno@unimedcnu.coop.br';
```

Usar `select ... from auth.users` garante que o `id` inserido é exatamente o mesmo do `auth.users` (evita o erro mais comum: digitar um uuid diferente).

## Verificação

```sql
select id, nome_completo, role, ativo
from udc.user_profiles
where id = '6deaca38-8b8c-466b-b748-ddec3333f6f5';
```

Deve retornar 1 linha com `role = 'analista'` e `ativo = true`. Depois disso a Veronice consegue logar normalmente em `/login-admin`.

## Observações
- **Nenhuma alteração de código** será feita — o sistema está em produção e o problema é apenas de dado faltante no banco.
- Se o insert falhar por RLS, rode-o como `service_role` (SQL Editor do Supabase já roda assim por padrão).
