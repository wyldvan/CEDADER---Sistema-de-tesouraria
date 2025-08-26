# Instruções de Migração para SQLite

## Resumo da Migração

Sua aplicação CEDADER foi migrada com sucesso do LocalStorage para SQLite no backend. Todos os dados sensíveis agora são armazenados de forma segura no banco de dados SQLite, enquanto a autenticação é feita via JWT tokens.

## Estrutura do Projeto Migrado

```
project/
├── backend/                 # Servidor Node.js/Express
│   ├── config/
│   │   └── database.js     # Configuração do SQLite
│   ├── models/             # Modelos Sequelize
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Registration.js
│   │   ├── Payment.js
│   │   ├── Prebenda.js
│   │   ├── PastorRegistration.js
│   │   ├── DocumentRange.js
│   │   ├── FinancialGoal.js
│   │   └── ObreiroRegistration.js
│   ├── routes/             # Rotas da API
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── transactions.js
│   │   ├── registrations.js
│   │   ├── payments.js
│   │   ├── prebendas.js
│   │   ├── pastorRegistrations.js
│   │   ├── documentRanges.js
│   │   └── financialGoals.js
│   ├── middleware/
│   │   └── auth.js         # Middleware de autenticação JWT
│   ├── scripts/
│   │   └── seedDatabase.js # Script para popular banco inicial
│   ├── server.js           # Servidor principal
│   ├── package.json
│   └── .env               # Variáveis de ambiente
└── project/               # Frontend React (migrado)
    ├── src/
    │   ├── services/
    │   │   └── api.ts     # Serviço para comunicação com API
    │   ├── contexts/
    │   │   └── AuthContext.tsx (migrado)
    │   └── hooks/         # Hooks migrados para usar API
    │       ├── useTransactions.ts
    │       ├── useRegistrations.ts
    │       ├── usePayments.ts
    │       ├── usePrebenda.ts
    │       ├── usePastorRegistrations.ts
    │       ├── useDocumentRanges.ts
    │       ├── useFinancialGoals.ts
    │       └── useObreiros.ts
    └── package.json
```

## Como Rodar a Aplicação Migrada

### 1. Instalar Dependências

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd project
npm install
```

### 2. Configurar Banco de Dados

O banco SQLite será criado automaticamente. Para popular com dados iniciais:

```bash
cd backend
npm run seed
```

Isso criará:
- Usuário admin padrão: `CEDADER`
- Senha padrão: `123456789`

### 3. Iniciar os Servidores

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
O backend rodará em: `http://localhost:3001`

#### Terminal 2 - Frontend:
```bash
cd project
npm run dev
```
O frontend rodará em: `http://localhost:5173`

### 4. Acessar a Aplicação

1. Abra o navegador em `http://localhost:5173`
2. Faça login com:
   - Usuário: `CEDADER`
   - Senha: `123456789`

## Dados Migrados para SQLite

### Dados Sensíveis (agora no SQLite):
- ✅ **Usuários e autenticação** (`cedader_user`, `cedader_users`)
- ✅ **Registros de pastores** (`cedader_pastor_registrations`)
- ✅ **Registros gerais** (`cedader_registrations`)
- ✅ **Pagamentos** (`cedader_payments`)
- ✅ **Prebendas** (`cedader_prebendas`)
- ✅ **Transações** (`cedader_transactions`)
- ✅ **Faixas de documentos** (`cedader_document_ranges`)
- ✅ **Metas financeiras** (`cedader_financial_goals`)

### Dados que Permaneceram no LocalStorage:
- **Obreiros** (`cedader_obreiros`) - Mantido para compatibilidade

## Principais Mudanças

### 1. Autenticação
- **Antes**: Dados de usuário salvos diretamente no LocalStorage
- **Agora**: Login via API com JWT token, dados seguros no SQLite

### 2. CRUD de Dados
- **Antes**: Todas as operações via LocalStorage
- **Agora**: Operações via API REST com autenticação

### 3. Segurança
- **Antes**: Senhas em texto plano no LocalStorage
- **Agora**: Senhas hasheadas com bcrypt no SQLite
- **Antes**: Dados expostos no navegador
- **Agora**: Dados protegidos no servidor

### 4. Estrutura da API

#### Endpoints de Autenticação:
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual
- `PUT /api/auth/credentials` - Atualizar credenciais

#### Endpoints de Dados:
- `/api/users` - Gerenciamento de usuários
- `/api/transactions` - Transações
- `/api/registrations` - Registros
- `/api/payments` - Pagamentos
- `/api/prebendas` - Prebendas
- `/api/pastor-registrations` - Registros de pastores
- `/api/document-ranges` - Faixas de documentos
- `/api/financial-goals` - Metas financeiras

Todos os endpoints requerem autenticação via Bearer token.

## Scripts Disponíveis

### Backend:
- `npm start` - Produção
- `npm run dev` - Desenvolvimento com nodemon
- `npm run seed` - Popular banco inicial

### Frontend:
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## Configurações Importantes

### Variáveis de Ambiente (.env):
```
PORT=3001
JWT_SECRET=cedader_jwt_secret_key_2024
NODE_ENV=development
DB_PATH=./database.sqlite
```

### CORS:
O backend está configurado para aceitar requisições de qualquer origem durante desenvolvimento.

## Migração de Dados Existentes

Se você tinha dados no LocalStorage da versão anterior:

1. Os dados permanecerão no LocalStorage até serem migrados manualmente
2. Faça login na nova versão e recrie os dados importantes
3. O sistema agora é mais seguro e os dados ficam persistidos no servidor

## Troubleshooting

### Backend não inicia:
- Verifique se a porta 3001 está livre
- Confirme se as dependências foram instaladas: `npm install`

### Frontend não conecta:
- Verifique se o backend está rodando em `http://localhost:3001`
- Confirme se não há bloqueios de CORS

### Problemas de login:
- Use as credenciais padrão: `CEDADER` / `123456789`
- Se necessário, rode `npm run seed` novamente

### Banco de dados corrompido:
- Delete o arquivo `database.sqlite` no backend
- Rode `npm run seed` para recriar

## Próximos Passos

1. **Teste todas as funcionalidades** da aplicação
2. **Migre dados importantes** do LocalStorage antigo
3. **Configure backup** do arquivo `database.sqlite`
4. **Considere deploy** em produção quando estiver satisfeito

A migração foi concluída com sucesso! Sua aplicação agora é mais segura e profissional.

