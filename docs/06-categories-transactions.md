# Categorias e transações

Esta etapa conecta o dinheiro que entra e sai a uma conta e a uma categoria da mesma organização.

## Ingredientes

- `Category`: classifica o lançamento como `INCOME` (receita) ou `EXPENSE` (despesa).
- `Transaction`: registra conta, categoria, valor em centavos, tipo, descrição e data.
- `Account`: conserva o saldo atual em centavos.

Uma receita de `2000` centavos soma R$ 20,00. Uma despesa de `750` centavos subtrai R$ 7,50. O resultado é `1250` centavos, ou R$ 12,50.

## Fluxo de criação

```text
POST /transactions
  → DTO valida UUIDs, tipo e valor positivo inteiro
  → caso de uso procura conta e categoria na organização informada
  → caso de uso confere se o tipo da categoria combina com o lançamento
  → repositório inicia uma transação no PostgreSQL
  → PostgreSQL bloqueia a linha da conta para escrita
  → repositório altera o saldo e insere o lançamento
  → PostgreSQL confirma as duas gravações juntas
```

Se a inserção falhar, o PostgreSQL desfaz também a alteração do saldo. O bloqueio da conta evita perder atualizações quando duas requisições chegam ao mesmo tempo. As chaves estrangeiras compostas também impedem que um lançamento aponte para conta ou categoria de outra organização.

## Rotas

```text
POST /categories
GET  /organizations/:organizationId/categories
GET  /organizations/:organizationId/categories/:categoryId

POST /transactions
GET  /organizations/:organizationId/transactions
GET  /organizations/:organizationId/transactions/:transactionId
```

Exemplo de categoria:

```json
{
  "organizationId": "UUID-DA-ORGANIZACAO",
  "name": "Vendas",
  "type": "INCOME"
}
```

Exemplo de transação:

```json
{
  "organizationId": "UUID-DA-ORGANIZACAO",
  "accountId": "UUID-DA-CONTA",
  "categoryId": "UUID-DA-CATEGORIA",
  "amountInCents": 2000,
  "type": "INCOME",
  "description": "Venda de pães"
}
```

`occurredAt` é opcional e aceita uma data ISO, como `2026-09-16T12:00:00Z`. Se omitido, usamos o horário da criação.

## Testes

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run test:integration
```

O teste de integração usa o PostgreSQL local. Ele cria dados temporários próprios e os remove ao terminar. Verifica rollback, concorrência e rejeição de categoria de outra organização.

## Limites desta etapa

A API ainda não autentica o usuário nem associa a organização ao usuário autenticado. Também não há chave de idempotência: reenviar o mesmo `POST /transactions` registra outro lançamento. Por isso, esta versão serve para estudo e testes locais; autenticação e proteção contra requisições repetidas serão tratadas antes de uso real.
