# Aula 7: transferências, relatório e acesso

## Fluxo em uma frase

O usuário cria uma organização e sua conta ADMIN, entra com e-mail e senha,
recebe um token JWT e o envia nas chamadas protegidas. A API confere o usuário,
o papel e a organização em cada chamada.

## Rotas

| Método e rota | Uso |
| --- | --- |
| `POST /auth/register` | Cria organização e primeiro administrador juntos. |
| `POST /auth/login` | Confere e-mail/senha e devolve `accessToken`. |
| `GET /auth/me` | Mostra id, organização e papel do usuário autenticado. |
| `POST /transfers` | Move centavos de uma conta para outra. |
| `GET /organizations/:organizationId/transfers` | Lista as transferências. |
| `GET /organizations/:organizationId/reports/monthly?month=YYYY-MM` | Soma receitas e despesas do mês em UTC. |

Somente `GET /health`, `POST /auth/register` e `POST /auth/login` são públicos.
As demais rotas exigem o cabeçalho `Authorization: Bearer <accessToken>`.
O token expira em 1 hora. O relatório retorna `incomeInCents`,
`expenseInCents`, `netInCents` e `transactionCount`.

## Papéis

| Ação | ADMIN | FINANCE_MANAGER | VIEWER |
| --- | --- | --- | --- |
| Consultar dados financeiros e relatório | Sim | Sim | Sim |
| Criar contas, categorias, transações e transferências | Sim | Sim | Não |
| Criar e listar usuários | Sim | Não | Não |

Toda chamada que informa `organizationId` precisa usar a organização do token.
O papel é consultado no banco a cada pedido, então a decisão não depende de um
papel antigo guardado no JWT.

## Por que a transferência é segura?

O banco bloqueia as duas contas sempre na mesma ordem. Dentro de uma única
transação SQL, a API confere o saldo, debita a origem, credita o destino e
registra a transferência. Se qualquer passo falhar, todos são desfeitos.
Transferências ficam em uma tabela própria e não contam como receita ou despesa.

## Exemplo de cadastro e login no PowerShell

```powershell
$body = @{ organizationName = 'Padaria'; name = 'Paulo'; email = 'paulo@example.com'; password = 'senha-forte-123' } | ConvertTo-Json
$registration = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/auth/register -ContentType 'application/json' -Body $body
$token = $registration.accessToken
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://127.0.0.1:3000/organizations/$($registration.organization.id)/reports/monthly?month=2026-09" -Headers $headers
```

Para transferir, envie JSON com `organizationId`, `fromAccountId`,
`toAccountId` e `amountInCents` para `POST /transfers`. Por exemplo, `2500`
centavos representam R$ 25,00. A conta de origem precisa ter saldo suficiente.

Para rodar tudo em outra máquina, configure `DATABASE_URL` e `JWT_SECRET` no
`.env`, inicie o PostgreSQL e execute `npm.cmd run migration:run` antes de
iniciar a API. Não coloque o token ou a chave JWT no Git.
