# FinTrack API

Projeto de estudo construído em pequenas etapas. A proposta é uma API financeira
para organizações, com contas, categorias, receitas, despesas e transferências.

## Etapa atual: categorias e transações

Implementado: organizações, usuários, contas, categorias e transações, com persistência no PostgreSQL. Receitas aumentam e despesas diminuem o saldo da conta. Autenticação e autorização virão depois do núcleo financeiro.

## Comece por aqui

- [Aula 1: executar e entender a primeira API](docs/01-primeira-api.md)
- [Aula 2: criar, listar e buscar organizações](docs/02-organizations.md)
- [Aula 3: PostgreSQL](docs/03-postgresql.md)
- [Aula 4: usuários](docs/04-users.md)
- [Aula 5: contas](docs/05-accounts.md)
- [Aula 6: categorias e transações](docs/06-categories-transactions.md)
- [Visão do produto e roteiro das próximas etapas](docs/00-roteiro.md)

## Executar no Windows

Use Node.js 24.20.0 ou superior da linha 24 e abra o terminal na pasta `fintrack`. Inicie o Docker Desktop antes destes comandos.

```powershell
npm.cmd ci
& 'C:\Users\paulo\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe' compose up -d
npm.cmd run migration:run
npm.cmd run start:dev
```

Se as dependências já estiverem instaladas, não precisa repetir `npm.cmd ci`.
Abra http://127.0.0.1:3000/health. Para parar o servidor, pressione Ctrl+C.

O comando de Docker acima usa o caminho da instalação local deste computador. O arquivo `.env` contém a conexão local e não é enviado ao Git; use `.env.example` como referência em outra máquina.

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
| `src/database/migrations/` | Histórico das tabelas do PostgreSQL. |
| `package.json` | Listar dependências e comandos. |
| `package-lock.json` | Registrar as versões instaladas para reprodução. |

A base foi gerada com o CLI oficial do NestJS 12. Ela inclui TypeScript,
Vitest para testes, Oxlint para análise do código e Prettier para formatação.
Essas ferramentas são explicadas aos poucos nas aulas.

Referência: [documentação oficial do NestJS](https://docs.nestjs.com/first-steps).
