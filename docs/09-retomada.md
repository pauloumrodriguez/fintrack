# FinTrack — ponto de retomada

Estado registrado em 16/09/2026. O código está na branch `main` e foi enviado
ao GitHub. Este arquivo é um lembrete para continuar o trabalho sem repetir as
etapas já concluídas.

## O que está pronto

- API NestJS com PostgreSQL, migrações e rotas de saúde.
- Organizações e usuários, cadastro inicial, login JWT e três papéis.
- Contas, categorias, receitas, despesas e saldo em centavos.
- Transferências atômicas com verificação do saldo de origem.
- Relatório mensal com receitas, despesas e saldos inicial/final por conta.
- Organização extra criada com administrador, sem cadastro órfão.
- Isolamento por usuário autenticado e RLS nas seis tabelas de negócio.
- Proteção contra reenvio de transações e transferências por `Idempotency-Key`.
- Testes de unidade, HTTP e PostgreSQL. Na última verificação, passaram 34, 26
  e 4 testes, respectivamente; build, lint e auditoria de dependências passaram.

## Como ligar o ambiente amanhã

1. Abra o Docker Desktop e o projeto `fintrack` no VS Code.
2. Abra um terminal PowerShell na pasta do projeto e execute, uma linha por vez:

   ```powershell
   docker compose up -d
   npm.cmd run migration:run
   npm.cmd run start:dev
   ```

3. Deixe esse terminal com a API aberta. Confira `http://127.0.0.1:3000/health`.
4. Use um segundo terminal para testes. `npm.cmd ci` só é necessário em uma
   instalação nova ou quando as dependências precisarem ser reinstaladas.

O `.env` local deve existir antes de iniciar a API. Use `.env.example` como
referência em outro computador, sem copiar senhas para o Git. O comando
`docker compose` não depende do caminho de instalação deste computador.

## Próxima etapa

Começar pela automação das verificações no GitHub: criar um fluxo que instala
as dependências, inicia um PostgreSQL de teste, aplica as migrações e executa
testes, lint e build em cada mudança. Depois revisar observabilidade e
publicação. Essas tarefas são novas etapas; não é necessário refazer os módulos
financeiros concluídos.
