# FinTrack — roteiro de construção

## Produto que queremos construir

Uma API financeira multi-tenant: várias organizações usam o sistema, mas cada
uma tem seus próprios usuários, contas, categorias e movimentações. Um usuário
de uma organização não pode acessar dados de outra.

Exemplo: a Empresa A tem uma conta com R$ 100,00. Uma receita de R$ 50,00 eleva
esse saldo a R$ 150,00; uma despesa de R$ 20,00 o reduz a R$ 130,00. A Empresa B
tem dados independentes.

## Entregas pequenas

1. **Atual:** aplicação NestJS com `GET /health` e guia da primeira aula.
2. Organização: modelo, regras, cadastro, PostgreSQL e migrations.
3. Usuários, autenticação e vínculo com organização.
4. Contas e categorias, com autorização e isolamento entre organizações.
5. Receitas e despesas, representação exata de dinheiro e consistência do saldo.
6. Transferências atômicas: débito e crédito acontecem juntos ou nenhum acontece.
7. Relatórios e revisão da arquitetura conforme as necessidades encontradas.
8. Proteções adicionais, automação de testes e publicação.

## Decisões que guiam as próximas aulas

- Começar com um único backend organizado em módulos.
- Usar TypeScript, NestJS e, na etapa de persistência, PostgreSQL.
- Testar regras relevantes quando forem implementadas.
- Definir o contexto da organização com base na identidade autenticada e nos
  vínculos autorizados; um `organizationId` recebido do cliente não prova acesso.
- Garantir que conta, categoria e movimentação pertençam à mesma organização.
- Escolher uma representação exata para dinheiro antes das operações financeiras.
- Garantir atomicidade e tratar concorrência desde a atualização do primeiro saldo.
- Introduzir DDD, CQRS e eventos quando houver uma necessidade concreta.
- Acrescentar RLS como proteção adicional no banco, com testes de isolamento.

O documento recebido descreve o destino. Este roteiro divide o percurso em aulas;
a primeira entrega ainda não cadastra organizações nem armazena dados.
