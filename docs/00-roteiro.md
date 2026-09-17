# FinTrack — roteiro de construção

## Produto que queremos construir

Uma API financeira multi-tenant: várias organizações usam o sistema, mas cada
uma tem seus próprios usuários, contas, categorias e movimentações. Um usuário
de uma organização não pode acessar dados de outra.

Exemplo: a Empresa A tem uma conta com R$ 100,00. Uma receita de R$ 50,00 eleva
esse saldo a R$ 150,00; uma despesa de R$ 20,00 o reduz a R$ 130,00. A Empresa B
tem dados independentes.

## Entregas pequenas

1. **Concluído:** aplicação NestJS com `GET /health` e guia da primeira aula.
2. **Concluído:** organização, cadastro, PostgreSQL e migrações.
3. **Concluído:** usuários, login e vínculo com organização.
4. **Concluído:** contas e categorias com autorização e isolamento por RLS.
5. **Concluído:** receitas e despesas em centavos, saldo consistente e idempotência.
6. **Concluído:** transferências atômicas com saldo suficiente e proteção contra reenvio.
7. **Concluído nesta fase:** relatório mensal com receitas, despesas e saldos de abertura e fechamento por conta; login JWT e papéis.
8. **Concluído nesta fase:** RLS nas seis tabelas de negócio, limite de tentativas e testes de segurança. Automação e publicação continuam como trabalhos futuros.

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
o progresso técnico está descrito no README e nos guias de cada etapa.
