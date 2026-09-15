# PostgreSQL e persistência

Nesta etapa, o módulo de organizações deixou de guardar dados apenas na memória e passou a usar PostgreSQL.

## Como as peças se conectam

1. O `docker-compose.yml` inicia um PostgreSQL exclusivo para o FinTrack.
2. O `.env` informa à API onde o banco está e quais credenciais usar.
3. O TypeORM faz a comunicação entre o código TypeScript e o PostgreSQL.
4. A migração cria a tabela `organizations` e registra que essa alteração já foi aplicada.
5. O `TypeOrmOrganizationRepository` converte os registros do banco em entidades do domínio.

O PostgreSQL do Docker usa a porta `5433` porque já existe outro PostgreSQL na porta `5432` deste computador.

## Comandos principais

Iniciar o banco:

```powershell
docker compose up -d
```

Aplicar migrações pendentes:

```powershell
npm.cmd run migration:run
```

Ver o estado das migrações:

```powershell
npm.cmd run migration:show
```

Iniciar a API:

```powershell
npm.cmd run start:dev
```

Parar o banco quando terminar de estudar:

```powershell
docker compose stop
```

O comando `stop` preserva os dados no volume do Docker.

## Decisão de segurança

`synchronize` permanece desativado. Mudanças no banco devem ser feitas por migrações, pois elas deixam um histórico revisável e reproduzível.

O arquivo `.env` contém a senha local e não entra no Git. O `.env.example` documenta somente um exemplo de configuração.
