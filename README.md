# FinTrack API

Projeto de estudo construído em pequenas etapas. A proposta é uma API financeira
para organizações, com contas, categorias, receitas, despesas e transferências.

## Etapa atual: primeira API

Implementado: `GET /health`, que responde com HTTP 200 e:

```json
{ "status": "ok", "service": "fintrack-api" }
```

Ainda não há banco de dados, autenticação ou funcionalidades financeiras.

## Comece por aqui

- [Aula 1: executar e entender a primeira API](docs/01-primeira-api.md)
- [Aula 2: criar, listar e buscar organizações](docs/02-organizations.md)
- [Visão do produto e roteiro das próximas etapas](docs/00-roteiro.md)

## Executar no Windows

Use Node.js 24.20.0 ou superior da linha 24 e abra o terminal na pasta `fintrack`.
Esta é a versão do Node usada na preparação desta etapa.

```powershell
npm.cmd ci
npm.cmd run start:dev
```

Se as dependências já estiverem instaladas, basta o segundo comando.
Abra http://127.0.0.1:3000/health. Para parar o servidor, pressione Ctrl+C.

## Verificar

```powershell
npm.cmd test
npm.cmd run test:e2e
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
| `src/app.module.ts` | Registrar o controller e o serviço. |
| `src/app.controller.ts` | Receber o pedido `GET /health`. |
| `src/app.service.ts` | Produzir os dados da resposta. |
| `test/app.e2e-spec.ts` | Conferir a resposta pela interface HTTP. |
| `package.json` | Listar dependências e comandos. |
| `package-lock.json` | Registrar as versões instaladas para reprodução. |

A base foi gerada com o CLI oficial do NestJS 12. Ela inclui TypeScript,
Vitest para testes, Oxlint para análise do código e Prettier para formatação.
Essas ferramentas serão explicadas aos poucos nas aulas.

Referência: [documentação oficial do NestJS](https://docs.nestjs.com/first-steps).
