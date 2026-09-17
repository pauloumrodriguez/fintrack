# Aula 7: transferências, relatório e acesso

## Fluxo em uma frase

O usuário cria uma organização e sua conta ADMIN, entra com e-mail e senha,
recebe um token JWT e o envia nas chamadas protegidas. A API confere o usuário,
o papel e a organização em cada chamada.

## Rotas

| Método e rota | Uso |
| --- | --- |
| `POST /auth/register` | Cria organização e primeiro administrador juntos. |
| `POST /organizations` | Administrador autenticado cria outra organização com um administrador e recebe token para ela. |
| `POST /auth/login` | Confere organização, e-mail e senha; devolve `accessToken`. |
| `GET /auth/me` | Mostra id, organização e papel do usuário autenticado. |
| `POST /transfers` | Move centavos de uma conta para outra. |
| `GET /organizations/:organizationId/transfers` | Lista as transferências. |
| `GET /organizations/:organizationId/reports/monthly?month=YYYY-MM` | Soma receitas e despesas do mês em UTC. |

Somente `GET /health`, `POST /auth/register` e `POST /auth/login` são públicos.
As demais rotas exigem o cabeçalho `Authorization: Bearer <accessToken>`.
O token expira em 1 hora. O relatório retorna `incomeInCents`,
`expenseInCents`, `netInCents`, `transactionCount`, `openingBalanceInCents`,
`closingBalanceInCents` e uma lista `accounts` com os saldos por conta.
As receitas e despesas usam `occurredAt`; as transferências usam a data de criação.
Transferências mudam os saldos das contas, mas não contam como receita ou despesa.

## Papéis

| Ação | ADMIN | FINANCE_MANAGER | VIEWER |
| --- | --- | --- | --- |
| Consultar dados financeiros e relatório | Sim | Sim | Sim |
| Criar contas, categorias, transações e transferências | Sim | Sim | Não |
| Criar e listar usuários | Sim | Não | Não |

No login, informe `organizationId` junto com e-mail e senha. Nas rotas protegidas,
o servidor usa a organização do token; o `organizationId` no corpo é opcional e,
se informado, precisa coincidir com o do token.
O papel é consultado no banco a cada pedido, então a decisão não depende de um
papel antigo guardado no JWT.

## Por que a transferência é segura?

O banco bloqueia as duas contas sempre na mesma ordem. Dentro de uma única
transação SQL, a API confere o saldo, debita a origem, credita o destino e
registra a transferência. Se qualquer passo falhar, todos são desfeitos.
Transferências ficam em uma tabela própria e não contam como receita ou despesa.
`POST /transfers` exige `Idempotency-Key`, como `POST /transactions`: repetir a
mesma chave e os mesmos dados devolve a transferência original sem mover o
saldo novamente. Reutilizar a chave com outros dados devolve HTTP 409.

## Exemplo de cadastro e login no PowerShell

```powershell
$body = @{ organizationName = 'Padaria'; name = 'Paulo'; email = 'paulo@example.com'; password = 'senha-forte-123' } | ConvertTo-Json
$registration = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/auth/register -ContentType 'application/json' -Body $body
$loginBody = @{ organizationId = $registration.organization.id; email = 'paulo@example.com'; password = 'senha-forte-123' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/auth/login -ContentType 'application/json' -Body $loginBody
$token = $login.accessToken
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://127.0.0.1:3000/organizations/$($registration.organization.id)/reports/monthly?month=2026-09" -Headers $headers
```

Para transferir, envie JSON com `fromAccountId`,
`toAccountId` e `amountInCents` para `POST /transfers`, junto com um cabeçalho
`Idempotency-Key` novo para cada transferência. Por exemplo, `2500`
centavos representam R$ 25,00. A conta de origem precisa ter saldo suficiente.

Ao criar outra organização com `POST /organizations`, envie `{ "name": "Nova unidade" }`
com o token de um administrador. A resposta inclui `accessToken` para a nova
organização. O administrador usa o mesmo e-mail e senha nas duas organizações;
no login, informa qual `organizationId` quer acessar.

Para rodar tudo em outra máquina, configure as variáveis do `.env.example` no
`.env`, inicie o PostgreSQL e execute `npm.cmd run migration:run` antes de
iniciar a API. Não coloque o token ou a chave JWT no Git.
