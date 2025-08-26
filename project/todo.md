## Tarefas de Migração para SQLite

### Fase 2: Identificar dados sensíveis e não sensíveis no LocalStorage
- [x] Analisar `AuthContext.tsx` para dados de usuário.
- [x] Analisar `usePastorRegistrations.ts` para dados de registro de pastores.
- [x] Analisar `useRegistrations.ts` para dados de registros gerais.
- [x] Analisar `usePayments.ts` para dados de pagamentos.
- [x] Analisar `usePrebenda.ts` para dados de prebendas.
- [x] Analisar `useTransactions.ts` para dados de transações.
- [x] Analisar `useDocumentRanges.ts` para dados de faixas de documentos.
- [x] Analisar `useFinancialGoals.ts` para dados de metas financeiras.
- [x] Listar dados sensíveis a serem migrados para SQLite.
  - `cedader_user`: Informações de autenticação do usuário (username, password, role, etc.).
  - `cedader_users`: Lista de todos os usuários.
  - `cedader_pastor_registrations`: Registros de pastores (nomes, campos, filhos, etc.).
  - `cedader_registrations`: Registros gerais (campo, mês, categoria, valor).
  - `cedader_payments`: Pagamentos (categoria, valor, método de pagamento, descrição).
  - `cedader_prebendas`: Prebendas (tipo, pastor, valor, mês, descrição).
  - `cedader_transactions`: Transações (tipo, categoria, valor, método de pagamento, descrição).
  - `cedader_document_ranges`: Faixas de documentos (nome, números inicial e final, status ativo).
  - `cedader_financial_goals`: Metas financeiras (campo, ano, metas mensais/anuais).
- [x] Listar dados não sensíveis a serem mantidos no LocalStorage.
  - Nenhum dado não sensível foi identificado nos arquivos fornecidos. Todos os dados armazenados no LocalStorage são considerados sensíveis e serão migrados para o SQLite.

### Fase 3: Configurar backend Node.js/Express com SQLite
- [x] Criar diretório para o backend.
- [x] Inicializar projeto Node.js.
- [x] Instalar dependências (Express, Sequelize/Prisma, SQLite3).
- [x] Configurar o servidor Express.

### Fase 4: Criar schema do banco de dados SQLite
- [x] Definir modelos Sequelize/Prisma para cada tipo de dado sensível.
- [x] Criar migrações para as tabelas do SQLite.

### Fase 5: Implementar APIs REST para dados sensíveis
- [x] Criar rotas de API para CRUD de usuários.
- [x] Criar rotas de API para CRUD de registros de pastores.
- [x] Criar rotas de API para CRUD de registros gerais.
- [x] Criar rotas de API para CRUD de pagamentos.
- [x] Criar rotas de API para CRUD de prebendas.
- [x] Criar rotas de API para CRUD de transações.
- [x] Criar rotas de API para CRUD de faixas de documentos.
- [x] Criar rotas de API para CRUD de metas financeiras.
- [x] Implementar lógica de autenticação e autorização.

### Fase 6: Migrar frontend para usar APIs em vez de LocalStorage
- [x] Atualizar `AuthContext.tsx` para usar APIs de autenticação.
- [x] Atualizar hooks (`usePastorRegistrations`, `useRegistrations`, `usePayments`, `usePrebenda`, `useTransactions`, `useDocumentRanges`, `useFinancialGoals`) para usar APIs.
- [x] Remover chamadas a `localStorage` para dados sensíveis.

### Fase 7: Testar aplicação migrada e documentar instruções
- [x] Testar funcionalidades de login e CRUD de dados sensíveis.
- [x] Testar funcionalidades de dados não sensíveis.
- [x] Escrever instruções detalhadas sobre como rodar a aplicação.

### Fase 8: Entregar aplicação migrada e instruções ao usuário
- [ ] Empacotar a aplicação migrada.
- [ ] Enviar instruções e arquivos ao usuário.

