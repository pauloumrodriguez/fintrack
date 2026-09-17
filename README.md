# FinTrack API

Projeto de estudo construído em pequenas etapas. A proposta é uma API financeira
para organizações, com contas, categorias, receitas, despesas e transferências.

## Etapa atual: isolamento e proteção contra repetição

Implementado: organizações, usuários, contas, categorias, transações, transferências, relatório mensal com saldos por conta, login com JWT, permissões por papel, isolamento por organização no PostgreSQL e proteção contra reenvio de transações e transferências. `POST /auth/register` cria a primeira organização e seu administrador; um administrador autenticado pode criar outra organização com `POST /organizations`, recebendo um token para ela.

## Executar no Windows

Use Node.js 24.20.0 ou superior da linha 24 e abra o terminal na pasta `fintrack`. Inicie o Docker Desktop antes destes comandos.

```powershell
npm.cmd ci
docker compose up -d
npm.cmd run migration:run
npm.cmd run start:dev
```

Se as dependências já estiverem instaladas, não precisa repetir `npm.cmd ci`.
Abra http://127.0.0.1:3000/health. Para parar o servidor, pressione Ctrl+C.

O comando de Docker acima usa o caminho da instalação local deste computador. O arquivo `.env` contém as conexões locais e a chave `JWT_SECRET`; ele não é enviado ao Git. Use `.env.example` como referência em outra máquina. A migração usa `MIGRATION_DATABASE_URL`; a API usa `DATABASE_URL` com a conta limitada `fintrack_app`. Em produção, forneça as credenciais de migração apenas ao processo de migração.

## Verificar

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run test:integration
npm.cmd run lint
npm.cmd run build
```

Para executar a versão compilada, pare o servidor de desenvolvimento e use:

```powershell
npm.cmd run start:prod
```

## Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| `src/main.ts` | Criar a aplicação e iniciar o servidor. |
| `src/app.module.ts` | Registrar os módulos da aplicação. |
| `src/app.controller.ts` | Receber o pedido `GET /health`. |
| `src/app.service.ts` | Produzir os dados da resposta. |
| `test/app.e2e-spec.ts` | Conferir a resposta pela interface HTTP. |
| `src/modules/accounts/` | Regras, rotas e persistência de contas. |
| `src/modules/categories/` | Categorias de receita e despesa. |
| `src/modules/transactions/` | Lançamentos financeiros e alteração atômica do saldo. |
| `src/modules/transfers/` | Transferência entre contas da mesma organização. |
| `src/modules/reports/` | Resumo mensal de receitas e despesas. |
| `src/modules/auth/` | Cadastro inicial, login, JWT e proteção das rotas. |
| `src/database/migrations/` | Histórico das tabelas do PostgreSQL. |
| `package.json` | Listar dependências e comandos. |
| `package-lock.json` | Registrar as versões instaladas para reprodução. |

A base foi gerada com o CLI oficial do NestJS 12. Ela inclui TypeScript,
Vitest para testes, Oxlint para análise do código e Prettier para formatação.
Essas ferramentas são explicadas aos poucos nas aulas.

Referência: [documentação oficial do NestJS](https://docs.nestjs.com/first-steps).
