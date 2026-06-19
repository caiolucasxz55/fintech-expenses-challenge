# Fintech Expenses Challenge

Plataforma interna de **Gestão Financeira Corporativa**: colaboradores registram e
acompanham movimentações financeiras por categoria (despesas operacionais, receitas
de clientes, reembolsos, etc.), com indicadores consolidados em um dashboard.

API em **NestJS** + interface em **Next.js (React 18)**, ambas em **TypeScript**.

> **Frontend (deploy):** https://zealous-island-04e6faf0f.7.azurestaticapps.net
> **Backend / Swagger:** https://fintech-api.azurewebsites.net/api/docs

---

## Sumário

- [Stack](#stack)
- [Decisões técnicas](#decisões-técnicas)
- [Deploy e infraestrutura](#deploy-e-infraestrutura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Rodando com Docker (recomendado)](#rodando-com-docker-recomendado)
- [Rodando manualmente](#rodando-manualmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Migrations e seed](#migrations-e-seed)
- [Credenciais de teste](#credenciais-de-teste)
- [Testes](#testes)
- [Principais endpoints](#principais-endpoints)

---

## Stack

| Camada   | Tecnologias |
|----------|-------------|
| Backend  | NestJS 10, TypeScript (strict), Prisma ORM, PostgreSQL, JWT (access + refresh), class-validator, Swagger, Helmet, Throttler |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, React Query (TanStack), Axios, Tailwind CSS, shadcn/ui, Sonner |
| Infra    | Docker + Docker Compose (local), Azure Static Web Apps (frontend), Azure Web App (backend), PostgreSQL via Render |

---

## Decisões técnicas

### Gerenciamento de estado — **React Query + Context API**

A maior parte do estado das telas é **server state** (transações, categorias e
indicadores do dashboard): dados que vivem no backend e precisam de cache,
revalidação, paginação e controle de _loading/erro_. O **React Query** resolve
exatamente isso, sem o _boilerplate_ de um store global. As mutações (criar/editar/
excluir) invalidam as _queries_ afetadas — por exemplo, alterar uma transação
invalida tanto a lista quanto o dashboard, mantendo a UI sempre consistente sem
nenhum gerenciamento manual.

O único estado verdadeiramente **global de cliente** é a sessão (usuário + tokens),
mantida num **Context API** enxuto (`AuthContext`). Não há necessidade de Redux ou
Zustand — seria complexidade sem retorno: o projeto não possui estado global complexo que justifique um store dedicado. O único estado compartilhado entre componentes é a sessão do usuário, que cabe perfeitamente num Context API simples


### Outras decisões

- **Camadas no frontend:** `types` (tipagem por domínio) → `lib/api-client` (Axios
  com interceptors) → `lib/api` (funções por recurso) → `hooks` (React Query) →
  `components`/`pages`. Componentes nunca falam com o Axios diretamente.
- **Tratamento de erros centralizado:** um interceptor do Axios desembrulha o
  envelope padronizado da API (`{ data, timestamp }`), normaliza erros e faz **refresh
  automático do token** em respostas `401`, com `refreshClient` isolado para evitar
  recursão.
- **Prisma + migrations:** schema versionado e migrations obrigatórias; valores
  monetários como `Decimal(15,2)` e tipo de transação como `enum`.
- **Dashboard calculado na API:** saldo, totais e _top_ categorias são agregados no
  backend (via `groupBy`/`aggregate` do Prisma), não no cliente.
- **Refresh token com rotação:** o refresh token é armazenado como hash bcrypt no
  banco; a cada renovação o par de tokens é substituído e o hash atualizado.
- **shadcn/ui + Tailwind CSS:** componentes acessíveis e consistentes, tema via CSS
  variables, configurado manualmente para compatibilidade com Tailwind v3.

---

## Deploy e infraestrutura

| Serviço  | Plataforma | URL |
|----------|------------|-----|
| Frontend | Azure Static Web Apps | https://zealous-island-04e6faf0f.7.azurestaticapps.net |
| Backend  | Azure Web App (container) | https://fintech-api.azurewebsites.net |
| Swagger  | — | https://fintech-api.azurewebsites.net/api/docs |
| Health   | — | https://fintech-api.azurewebsites.net/health |
| Banco    | Render (PostgreSQL 16) | — |

A aplicação foi implantada utilizando Azure para hospedagem do frontend e backend,
enquanto o PostgreSQL foi provisionado no Render. A escolha foi feita para reduzir
o tempo de provisionamento da infraestrutura de banco de dados e permitir maior foco
na implementação das regras de negócio, arquitetura NestJS, tipagem TypeScript e
experiência do usuário.

O frontend é servido via **Azure Static Web Apps**, que realiza o build diretamente
a partir do repositório GitHub via CI/CD (GitHub Actions), sem necessidade de
containerização. O backend é empacotado em Docker, publicado no **Azure Container
Registry** e executado em um **Azure Web App** no plano B1 (Linux). O pipeline
(`.github/workflows/deploy.yml`) realiza os dois deploys em paralelo a cada push na
branch `main`.

---

## Estrutura do repositório

```
.
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── auth/             # registro, login, refresh, logout
│   │   ├── users/
│   │   ├── categories/
│   │   ├── transactions/
│   │   ├── dashboard/
│   │   ├── health/           # GET /health
│   │   ├── prisma/           # PrismaModule global
│   │   └── common/           # interceptors, filters, guards, security
│   └── prisma/               # schema, migrations e seed
├── frontend/                 # Next.js 14 (App Router)
│   └── src/
│       ├── types/            # tipagem por domínio (auth, category, transaction…)
│       ├── lib/              # api-client, api, formatters, utils
│       ├── hooks/            # React Query (useCategories, useTransactions…)
│       ├── context/          # AuthContext, QueryProvider
│       ├── components/       # ui, layout, auth, dashboard, transactions, categories
│       └── app/              # rotas: login, register, (app)/dashboard…
├── .github/workflows/
│   └── deploy.yml            # CI/CD: backend (Docker→ACR→WebApp) + frontend (SWA)
├── docker-compose.yml        # postgres + backend + frontend (ambiente local)
└── README.md
```

---

## Pré-requisitos

- **Node.js** 20+
- **npm** 10+
- **Docker** e **Docker Compose** (para rodar localmente de forma completa)
- PostgreSQL 16 (se preferir rodar manualmente sem Docker)

---

## Rodando com Docker (recomendado)

Sobe banco, API e frontend de uma vez:

```bash
# na raiz do projeto
docker compose up --build
```

| Serviço   | URL |
|-----------|-----|
| Frontend  | http://localhost:3001 |
| API       | http://localhost:3000/api |
| Swagger   | http://localhost:3000/api/docs |
| PostgreSQL| localhost:5433 |

O backend roda as migrations automaticamente ao subir. Para popular os dados de
demonstração:

```bash
docker compose exec backend npx prisma db seed
# ou localmente:
cd backend && npm run seed
```

---

## Rodando manualmente

### 1. Banco de dados

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env       # ajuste as variáveis conforme necessário
npm run prisma:generate
npm run prisma:migrate:dev  # cria as tabelas
npm run seed                # popula dados de demonstração (opcional)
npm run start:dev           # API em http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
# crie frontend/.env.local com NEXT_PUBLIC_API_URL=http://localhost:3000/api
npm run dev                 # app em http://localhost:3001
```

---

## Variáveis de ambiente

### Raiz (`/.env`) — Docker Compose

```env
POSTGRES_USER=fintech
POSTGRES_PASSWORD=fintech123
POSTGRES_DB=fintech_db
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Backend (`/backend/.env`)

```env
DATABASE_URL=postgresql://fintech:fintech123@localhost:5433/fintech_db

JWT_SECRET=supersecret_mude_em_producao
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refresh_supersecret_mude_em_producao
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

### Frontend (`/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Migrations e seed

```bash
cd backend

# Desenvolvimento (cria e aplica migrations)
npm run prisma:migrate:dev

# Produção (aplica migrations existentes — usado no Docker)
npm run prisma:migrate:prod

# Popula o banco com usuário de teste, 10 categorias e ~50 transações
npm run seed
```

O seed é **idempotente**: pode ser rodado várias vezes (recria os dados do usuário
de demonstração sem duplicar).

---

## Credenciais de teste

Após rodar o seed:

| Campo  | Valor |
|--------|-------|
| E-mail | `admin@fincorp.com.br` |
| Senha  | `admin123` |

A conta vem com 10 categorias corporativas e transações de março a junho/2026,
suficientes para visualizar o dashboard com saldo, entradas, saídas e _top_
categorias.

---

## Testes

```bash
cd backend
npm test           # testes unitários (Jest)
npm run test:e2e   # testes end-to-end (Supertest)
```

O backend possui mais de 10 testes significativos cobrindo autenticação (registro,
login, refresh, logout), isolamento por usuário, validação de DTOs e guards.

---

## Principais endpoints

Todos sob o prefixo `/api`. Rotas protegidas exigem `Authorization: Bearer <token>`.

| Método     | Rota                  | Descrição |
|------------|-----------------------|-----------|
| POST       | `/auth/register`      | Cria usuário (nome, e-mail, senha) |
| POST       | `/auth/login`         | Autentica e retorna access + refresh token |
| POST       | `/auth/refresh`       | Renova o access token via refresh token |
| POST       | `/auth/logout`        | Invalida o refresh token |
| GET/POST   | `/categories`         | Lista / cria categorias |
| PUT/DELETE | `/categories/:id`     | Edita / remove categoria |
| GET/POST   | `/transactions`       | Lista (com filtros e paginação) / cria |
| PUT/DELETE | `/transactions/:id`   | Edita / remove transação |
| GET        | `/dashboard`          | Saldo, entradas, saídas, top 3 categorias |
| GET        | `/health`             | Health check (`{ status: "ok" }`) |

**Filtros de `/transactions`:** `type`, `categoryId`, `startDate`, `endDate`, `page`, `limit`.

Documentação interativa completa em **`/api/docs`** (Swagger UI).
