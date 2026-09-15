# Aula 2 — Organizações

## O que funciona

O módulo de organizações possui três operações:

| Método | Caminho | Resultado |
| --- | --- | --- |
| `POST` | `/organizations` | Cria uma organização. |
| `GET` | `/organizations` | Lista as organizações. |
| `GET` | `/organizations/:id` | Busca uma organização pelo identificador. |

Os dados ficam em memória. Eles desaparecem quando a API é reiniciada. Essa
implementação temporária permite estudar regras e testes antes de conectar o
PostgreSQL.

## Criar

```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3000/organizations" -ContentType "application/json" -Body '{"name":"Padaria do Paulo"}'
```

O nome é obrigatório, aceita até 100 caracteres e não pode se repetir. A
comparação de duplicidade ignora espaços nas extremidades e diferenças entre
letras maiúsculas e minúsculas.

## Listar

Abra <http://127.0.0.1:3000/organizations> ou execute:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/organizations"
```

## Buscar por identificador

Substitua `<id>` pelo UUID devolvido na criação:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/organizations/<id>"
```

Um UUID malformado retorna HTTP 400. Um UUID válido que não corresponde a uma
organização retorna HTTP 404. Um nome duplicado retorna HTTP 409.

## Caminho da operação

```text
HTTP → Controller → Use Case → Entity/Repository → resposta HTTP
```

- **Presentation** recebe HTTP, valida o formato e traduz erros.
- **Application** coordena cada operação.
- **Domain** contém a entidade e o contrato do repositório.
- **Infrastructure** guarda os dados, por enquanto em memória.
