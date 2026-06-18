# Fintech Expenses Challenge

Plataforma interna de **Gestão Financeira Corporativa**: colaboradores registram e
acompanham movimentações financeiras por categoria (despesas operacionais, receitas
de clientes, reembolsos, etc.), com indicadores consolidados em um dashboard.

API em **NestJS** + interface em **Next.js (React 18)**, ambas em **TypeScript**.

> **Deploy público:** _<adicione aqui a URL do deploy do frontend>_
> **API / Swagger:** _<URL da API>/api/docs_

---

## Sumário

- [Stack](#stack)
- [Decisões técnicas](#decisões-técnicas)
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

| Camada     | Tecnologias |
|------------|-------------|
| Backend    | NestJS 10, TypeScript (strict), Prisma ORM, PostgreSQL, JWT (access + refresh), class-validator, Swagger, Helmet, Throttler |
| Frontend   | Next.js 14 (App Router), React 18, TypeScript, React Query (TanStack), Axios, React Hook Form, Tailwind CSS, shadcn/ui |
| Infra      | Docker + Docker Compose, PostgreSQL 16 |

---

## Decisões técnicas

### Gerenciamento de estado (frontend) — **React Query + Context API**

A maior parte do estado das telas é **server state** (transações, categorias e
indicadores do dashboard): dados que vivem no backend e precisam de cache,
revalidação, paginação e controle de _loading/erro_. O **React Query** resolve
exatamente isso, sem o _boilerplate_ de um store global. As mutações (criar/editar/
excluir) invalidam as _queries_ afetadas — por exemplo, alterar uma transação
invalida tanto a lista quanto o dashboard, mantendo a UI sempre consistente.

O único estado verdadeiramente **global de cliente** é a sessão (usuário + tokens),
mantida num **Context API** enxuto (`AuthContext`). Não há necessidade de Redux ou
Zustand — seria complexidade sem retorno, contrariando o princípio de evitar
_over-engineering_.

### Outras decisões

- **Camadas no frontend:** `types` (tipagem por domínio) → `lib/api-client` (Axios
  com interceptors) → `lib/api` (funções por recurso) → `hooks` (React Query) →
  `components`/`pages`. Componentes nunca falam com o Axios diretamente.
- **Tratamento de erros centralizado:** um interceptor do Axios desembrulha o
  envelope padronizado da API (`{ data, timestamp }`), normaliza erros e faz **refresh
  automático do token** em respostas `401`.
- **Prisma + migrations:** schema versionado e migrations obrigatórias; valores
  monetários como `Decimal(15,2)` e tipo de transação como `enum`.
- **Dashboard calculado na API:** saldo, totais e _top_ categorias são agregados no
  backend (via `groupBy`/`aggregate`), não no cliente.
- **shadcn/ui + Tailwind:** componentes acessíveis e consistentes, com tema via CSS
  variables.

---

## Estrutura do repositório

```
.
├── backend/            # API NestJS
│   ├── src/            # módulos: auth, users, categories, transactions, dashboard, common
│   └── prisma/         # schema, migrations e seed
├── frontend/           # Next.js (App Router)
│   └── src/            # types, lib, hooks, context, components, app
├── docker-compose.yml  # postgres + backend + frontend
└── README.md
```

---

## Pré-requisitos

- **Node.js** 20+
- **npm** 10+
- **PostgreSQL** 16 (ou **Docker** + **Docker Compose**, que já sobem o banco)

---

## Rodando com Docker (recomendado)

Sobe banco, API e frontend de uma vez:

```bash
# na raiz do projeto
docker compose up --build
```

- Frontend: http://localhost:3001
- API: http://localhost:3000/api  ·  Swagger: http://localhost:3000/api/docs
- PostgreSQL: localhost:5433

O backend roda as migrations automaticamente ao subir. Para popular os dados de
demonstração (ver [seed](#migrations-e-seed)):

```bash
docker compose exec backend npx prisma db seed
```

> A variável `NEXT_PUBLIC_API_URL` é embutida no build do frontend. Para apontar
> para outra API, defina-a antes do build (ex.: `NEXT_PUBLIC_API_URL=https://api.exemplo.com/api docker compose build frontend`).

---

## Rodando manualmente

### 1. Banco de dados

Suba apenas o Postgres (via Docker) ou use uma instância local:

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env          # se existir; senão veja a seção de variáveis
npm run prisma:generate
npm run prisma:migrate:dev    # cria as tabelas
npm run seed                  # popula dados de demonstração (opcional)
npm run start:dev             # API em http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
# garanta o arquivo .env.local (veja abaixo)
npm run dev                   # app em http://localhost:3001
```

---

## Variáveis de ambiente

### Raiz (`/.env`) — usada pelo Docker Compose

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

# Desenvolvimento (cria/aplica migrations)
npm run prisma:migrate:dev

# Produção (apenas aplica migrations existentes)
npm run prisma:migrate:prod

# Popula o banco com o usuário de teste, categorias e ~50 transações reais
npm run seed
```

O seed é **idempotente**: pode ser rodado várias vezes (recria os dados do usuário
de demonstração).

---

## Credenciais de teste

Após rodar o seed, use:

| Campo  | Valor |
|--------|-------|
| E-mail | `marina.costa@fincorp.com.br` |
| Senha  | `fincorp123` |

A conta vem com 10 categorias corporativas e transações de março a junho/2026,
suficientes para visualizar o dashboard com saldo, entradas, saídas e _top_
categorias.

---

## Testes

```bash
cd backend
npm test          # testes unitários
npm run test:e2e  # testes end-to-end
```

---

## Principais endpoints

Todos sob o prefixo `/api`. Rotas protegidas exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|--------|------|-----------|
| POST   | `/auth/register` | Cria usuário (nome, e-mail, senha) |
| POST   | `/auth/login` | Autentica e retorna tokens |
| POST   | `/auth/refresh` | Renova o access token |
| POST   | `/auth/logout` | Invalida o refresh token |
| GET/POST | `/categories` | Lista / cria categorias |
| PUT/DELETE | `/categories/:id` | Edita / remove categoria |
| GET/POST | `/transactions` | Lista (com filtros e paginação) / cria |
| PUT/DELETE | `/transactions/:id` | Edita / remove transação |
| GET    | `/dashboard` | Indicadores (saldo, entradas, saídas, top categorias) |

Filtros de `/transactions`: `type`, `categoryId`, `startDate`, `endDate`, `page`, `limit`.

Documentação interativa completa em **`/api/docs`** (Swagger).
