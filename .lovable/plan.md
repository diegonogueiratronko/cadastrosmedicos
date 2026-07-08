## Objetivo

Garantir, no lado do frontend, que o valor da Razão Social sempre chegue ao n8n mesmo se algum node estiver lendo o campo com outro nome.

## Alteração

Arquivo único: `src/services/cadastroService.ts`

Na função `enviarCadastro`, logo após a linha atual:

```ts
formData.append("razao_social", dados.razaoSocial.trim());
```

adicionar envios redundantes com o **mesmo valor** sob nomes alternativos comumente usados:

```ts
const razaoSocialValor = dados.razaoSocial.trim();
formData.append("razao_social", razaoSocialValor);
formData.append("razaoSocial", razaoSocialValor);
formData.append("RAZAO_SOCIAL", razaoSocialValor);
```

## Por que é seguro

- Só **adiciona** campos ao FormData; não remove nem renomeia nada.
- O campo original `razao_social` continua sendo enviado exatamente como hoje, então o fluxo atual do n8n que já funciona para os outros cadastros permanece intacto.
- Nenhuma alteração em validações, tipos, componentes de UI, outros serviços ou no n8n.

## Fora de escopo

- Não altero nenhum outro campo do formulário.
- Não mexo em `StepDadosEmpresa.tsx`, `Cadastro.tsx`, validators ou tipos.
- Não faço alterações no fluxo do n8n (fica sob seu controle).
