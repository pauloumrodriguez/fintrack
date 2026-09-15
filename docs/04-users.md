# Módulo de usuários

Esta etapa adiciona usuários vinculados a organizações.

## Os 20 passos realizados

1. Criar a pasta `modules/users`.
2. Definir os papéis `ADMIN`, `FINANCE_MANAGER` e `VIEWER`.
3. Criar a entidade de domínio `User`.
4. Normalizar nome e e-mail.
5. Validar as regras básicas da entidade.
6. Criar o contrato `UserRepository`.
7. Criar o repositório em memória para testes.
8. Criar a abstração `PasswordHasher`.
9. Implementar o hash de senha com Argon2id.
10. Criar o caso de uso de cadastro.
11. Verificar se a organização existe antes do cadastro.
12. Impedir e-mails duplicados.
13. Criar o caso de uso de listagem por organização.
14. Criar o DTO e validar os dados HTTP.
15. Criar o mapper que remove o hash da resposta.
16. Criar o controller e as rotas HTTP.
17. Criar o modelo de persistência do TypeORM.
18. Criar o repositório PostgreSQL.
19. Criar e executar a migração da tabela `users`.
20. Adicionar testes unitários e E2E.

## Fluxo do cadastro

```text
POST /users
    ↓
CreateUserDto valida os dados
    ↓
CreateUserUseCase verifica organização e e-mail
    ↓
Argon2 transforma a senha em hash
    ↓
UserRepository salva no PostgreSQL
    ↓
UserHttpMapper devolve o usuário sem senha e sem hash
```

## Rotas

Cadastrar um usuário:

```http
POST /users
Content-Type: application/json

{
  "organizationId": "UUID-DA-ORGANIZACAO",
  "name": "Paulo",
  "email": "paulo@example.com",
  "password": "senha-segura",
  "role": "ADMIN"
}
```

Listar os usuários de uma organização:

```http
GET /organizations/UUID-DA-ORGANIZACAO/users
```

## Regra de segurança

A senha recebida existe em texto puro somente durante a requisição. Antes de chegar ao banco, ela é convertida em um hash Argon2id. A API nunca inclui `password` ou `passwordHash` na resposta.

Autenticação e JWT ainda não fazem parte desta etapa. Eles serão adicionados depois do núcleo financeiro, conforme o roteiro do projeto.
