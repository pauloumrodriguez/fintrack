# Aula 8: isolamento e transações repetidas

## Organização do usuário

O login recebe `organizationId`, e-mail e senha. Após conferir a senha, a API
assina um token. Nas rotas protegidas, ela valida o token, procura o usuário
no banco e usa a organização desse usuário. Um `organizationId` diferente no
corpo ou no endereço da rota recebe HTTP 403. O cliente não precisa enviar
`organizationId` no corpo ao criar contas, categorias, usuários, transações
ou transferências.

## Segunda proteção: PostgreSQL

A API se conecta como `fintrack_app`, uma conta sem poderes de administrador.
As seis tabelas de negócio têm RLS (*Row Level Security*). Cada operação abre
uma transação SQL, define nela a organização e usa a mesma conexão até o fim.
Sem esse contexto, nenhuma linha aparece. Com o contexto da organização A,
as linhas da B não podem ser lidas nem inseridas. O contexto desaparece quando
a transação termina, inclusive se houver erro.

As migrações usam outra conexão (`MIGRATION_DATABASE_URL`) para alterar o
esquema. A API exige que `DATABASE_URL` use o usuário `fintrack_app`. Em
produção, não entregue a senha de migração ao processo da API. RLS protege
contra consultas sem filtro ou com filtro errado; ele não substitui proteção
contra execução arbitrária de SQL com as credenciais da aplicação.

## Evitar lançamentos duplicados

Todo `POST /transactions` exige o cabeçalho `Idempotency-Key` com 8 a 128
caracteres seguros. Gere uma chave nova para cada intenção de lançamento e
**reutilize a mesma chave ao tentar novamente** após uma falha de rede.

```powershell
$headers = @{ Authorization = "Bearer $token"; 'Idempotency-Key' = [guid]::NewGuid().ToString() }
$body = @{ accountId = $accountId; categoryId = $categoryId; amountInCents = 2500; type = 'INCOME' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/transactions -Headers $headers -ContentType 'application/json' -Body $body
```

Reenviar **a mesma chave e os mesmos dados** devolve o lançamento original,
sem alterar o saldo de novo. Reutilizar a chave com dados diferentes recebe
HTTP 409. A chave é única dentro da organização, e o banco aplica essa regra
mesmo quando duas requisições chegam simultaneamente. O hash usado na
comparação fica no banco e não aparece nas respostas da API.

## Tentativas de acesso

`/auth/login` e `/auth/register` aceitam até 10 tentativas por minuto por IP
e rota; depois respondem HTTP 429. Esse contador fica na memória do processo.
Para várias instâncias da API, será necessário armazenamento compartilhado.
