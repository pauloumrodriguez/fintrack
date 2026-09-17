# Módulo de contas

> Esta aula descreve a etapa original. Na API atual, as rotas exigem JWT,
> a organização vem do usuário autenticado e o PostgreSQL aplica RLS.

Uma conta pertence a uma organização, tem nome e começa com saldo zero. O saldo é representado por um número inteiro de centavos: `1050` significa R$ 10,50. A etapa seguinte, descrita em [categorias e transações](06-categories-transactions.md), adiciona os lançamentos que alteram esse saldo.

## Os 40 passos desta etapa

1. Definir os dados básicos de `Account`.
2. Guardar o identificador da organização na conta.
3. Remover espaços nas pontas do nome.
4. Rejeitar nomes vazios.
5. Limitar o nome a 100 caracteres.
6. Iniciar o saldo em zero centavos.
7. Aceitar apenas valores inteiros seguros em centavos.
8. Testar as regras da entidade.
9. Definir o contrato `AccountRepository`.
10. Definir a operação de salvar.
11. Definir a busca por ID e organização.
12. Definir a busca por nome e organização.
13. Definir a listagem por organização.
14. Criar o repositório em memória para testes.
15. Criar o caso de uso de cadastro.
16. Verificar se a organização existe.
17. Rejeitar nome repetido dentro da organização.
18. Permitir o mesmo nome em organizações diferentes.
19. Gerar um UUID para a conta.
20. Registrar a data de criação.
21. Criar o caso de uso de consulta por ID.
22. Retornar erro quando a conta não pertence à organização consultada.
23. Criar o caso de uso de listagem.
24. Criar o DTO de entrada do cadastro.
25. Validar o UUID da organização no corpo da requisição.
26. Normalizar e validar o nome recebido por HTTP.
27. Rejeitar campos extras, como um saldo enviado pelo cliente.
28. Criar o mapeamento da entidade para a resposta HTTP.
29. Criar `POST /accounts`.
30. Criar `GET /organizations/:organizationId/accounts`.
31. Criar `GET /organizations/:organizationId/accounts/:accountId`.
32. Validar os UUIDs recebidos na URL.
33. Converter erros de negócio em respostas 404 e 409.
34. Criar a entidade de persistência do TypeORM.
35. Criar o repositório PostgreSQL com consultas filtradas por organização.
36. Criar a migração da tabela `accounts`.
37. Criar a chave estrangeira para `organizations`.
38. Criar um índice único por organização e nome normalizado.
39. Registrar o módulo no Nest e adicionar testes unitários e HTTP.
40. Aplicar a migração e comprovar criação, listagem e duplicidade no banco real.

## Fluxo de uma criação

```text
POST /accounts
  → CreateAccountDto valida a entrada
  → CreateAccountUseCase verifica organização e nome repetido
  → Account cria a conta com saldo zero
  → AccountRepository salva no PostgreSQL
  → AccountHttpMapper monta a resposta
```

## Exemplo

```http
POST /accounts
Content-Type: application/json

{
  "organizationId": "3940b05c-42ad-4b2e-89ca-255295ebf2a3",
  "name": "Conta principal"
}
```

Para listar, abra `GET /organizations/3940b05c-42ad-4b2e-89ca-255295ebf2a3/accounts`.

## Atenção para a próxima fase

As consultas exigem `organizationId` e filtram por ele, mas ainda não existe autenticação. Por enquanto, o cliente pode informar qualquer organização. JWT, autorização e isolamento completo de tenants serão acrescentados na fase de segurança do roteiro.
