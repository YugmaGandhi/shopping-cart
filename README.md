# Shopping Cart

A production-grade, full-stack shopping cart: product catalog with search/sort/filter/pagination,
a cart with live quantity controls and totals, JWT auth with roles, and a minimal admin product
console. TypeScript end to end, with a documented REST API.

- **Client:** Vite + React 18, Redux Toolkit + RTK Query, React Hook Form + Zod, Tailwind (design
  tokens) + shadcn/ui.
- **Server:** Express + TypeScript, Mongoose 8, JWT + bcrypt, Zod validation, OpenAPI/Swagger.
- **Database:** MongoDB (via Docker).

---

## How this was built

This project was built **AI-assisted (Claude Code), under my direction and review** — not generated
in one shot. My workflow was deliberately planning-first and incremental:

1. **I planned the whole thing up front.** The [`docs/`](./docs) folder contains the implementation
   plan I wrote _before_ writing code — a master plan plus a document per phase, each broken into
   small stages (≈ one commit each). It's committed here as a record of that process.
2. **I built it phase by phase, reviewing every stage.** After each stage I read the code, ran
   typecheck / lint / tests, exercised the API and UI, and only then committed. The git history
   reflects that one-stage-per-commit cadence.
3. **I drove the key engineering decisions.** Among the things I specified or changed during review:
   - a **husky + lint-staged pre-commit guard** (format + lint + typecheck) so broken code can't land;
   - a **single response envelope** (`{ success, data, meta? }` / `{ success, error }`) across every
     endpoint, with **centralized error handling**;
   - **pulling Swagger UI earlier** (out of the delivery phase) so I could exercise the API in a browser
     before building any client code;
   - **Tailwind design tokens** (CSS variables) and a real **component library (shadcn/ui)** — with
     **no emoji icons** (lucide only);
   - API **versioning** (`/api/v1`) and **search/filter/sort/pagination** on the product list.
4. **I caught and fixed real issues in review** — e.g. the cart leaking across accounts after an
   account switch (fixed by resetting the RTK Query cache on auth change, now covered by a regression
   test), and a Mongoose `InferSchemaType` typing pitfall (resolved with explicit document interfaces).

In short: Claude Code accelerated the implementation, but the architecture, decisions, reviews, and
verification are mine.

---

## Tech stack

| Layer              | Choice                                                                    |
| ------------------ | ------------------------------------------------------------------------- |
| Runtime            | Node `22.22.3` (pinned via `.nvmrc` + `engines`)                          |
| Language           | TypeScript (client & server)                                              |
| Frontend           | Vite 7 + React 18                                                         |
| State / data       | Redux Toolkit + RTK Query                                                 |
| Forms / validation | React Hook Form + Zod                                                     |
| Styling / UI       | Tailwind CSS (design tokens) + shadcn/ui (Radix)                          |
| Backend            | Express + TypeScript (routes → controller → service)                      |
| ODM                | Mongoose 8                                                                |
| Auth               | JWT access token + bcrypt + `role` (user/admin)                           |
| API docs           | Swagger UI + committed `openapi.json` (generated from Zod)                |
| DB                 | MongoDB via Docker                                                        |
| Tests              | Jest + supertest + mongodb-memory-server (server) · Vitest + RTL (client) |

---

## Repository layout

```
shopping-cart/
├── client/                 # Vite + React + Redux Toolkit
│   └── src/{app,features,components,routes,lib,tests}
├── server/                 # Express + TypeScript + Mongoose
│   ├── src/{config,models,middleware,modules,schemas,docs,utils,constants}
│   ├── scripts/            # seed, openapi generator
│   └── tests/              # integration tests
├── docs/                   # phased implementation plan (written before coding)
├── docker-compose.yml      # local MongoDB
└── .nvmrc / .husky/        # node pin / pre-commit guard
```

---

## Prerequisites

- **Node `22.22.3`** — `nvm use` (reads `.nvmrc`). ESLint 9 requires Node 18+.
- **Docker** — for local MongoDB.

---

## Setup

```bash
# 0) clone + use the pinned Node version
git clone https://github.com/YugmaGandhi/shopping-cart.git
cd shopping-cart
nvm use                       # -> Node 22.22.3
npm install                   # root tooling (husky hooks)

# 1) MongoDB via Docker
docker compose up -d
#   If the compose plugin isn't installed, use the documented fallback:
#   docker run -d --name shopping-cart-mongo -p 27017:27017 \
#     -v shopping-cart-mongo-data:/data/db mongo:7

# 2) Server
cd server
cp .env.example .env          # defaults work with the Docker Mongo above
npm install
npm run seed                  # ~10 products + admin & user accounts
npm run dev                   # http://localhost:4000  (Swagger at /api/docs)

# 3) Client  (new terminal)
cd client
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:5173
```

> **Important:** the client must run on the origin in the server's `CLIENT_ORIGIN`
> (default `http://localhost:5173`), otherwise CORS will block requests. Change both if you
> need a different port.

### Seeded credentials

| Role  | Email            | Password    |
| ----- | ---------------- | ----------- |
| Admin | `admin@shop.com` | `Admin123!` |
| User  | `user@shop.com`  | `User1234!` |

---

## Environment variables

**`server/.env`**

| Var              | Example                                   | Purpose               |
| ---------------- | ----------------------------------------- | --------------------- |
| `PORT`           | `4000`                                    | API port              |
| `MONGO_URI`      | `mongodb://localhost:27017/shopping-cart` | Mongo connection      |
| `JWT_SECRET`     | (≥16 chars)                               | JWT signing secret    |
| `JWT_EXPIRES_IN` | `7d`                                      | Access token lifetime |
| `CLIENT_ORIGIN`  | `http://localhost:5173`                   | Allowed CORS origin   |

**`client/.env`**

| Var            | Example                 | Purpose                             |
| -------------- | ----------------------- | ----------------------------------- |
| `VITE_API_URL` | `http://localhost:4000` | API root (client appends `/api/v1`) |

---

## API reference

Interactive docs (with "try it out" + bearer auth): **`http://localhost:4000/api/docs`**.
Raw spec: `GET /api/docs.json`, or import the committed [`server/openapi.json`](./server/openapi.json)
into Postman. All resource routes are under `/api/v1`; every response uses the standard envelope.

| Method   | Path                            | Auth  | Description                                                                          |
| -------- | ------------------------------- | ----- | ------------------------------------------------------------------------------------ |
| `POST`   | `/api/v1/auth/register`         | —     | Register → `{ token, user }`                                                         |
| `POST`   | `/api/v1/auth/login`            | —     | Login → `{ token, user }`                                                            |
| `GET`    | `/api/v1/auth/me`               | user  | Current user                                                                         |
| `GET`    | `/api/v1/products`              | —     | List (`search`, `sort`, `minPrice`, `maxPrice`, `page`, `limit`) + pagination `meta` |
| `GET`    | `/api/v1/products/:id`          | —     | Product detail                                                                       |
| `POST`   | `/api/v1/products`              | admin | Create product                                                                       |
| `PATCH`  | `/api/v1/products/:id`          | admin | Update product                                                                       |
| `DELETE` | `/api/v1/products/:id`          | admin | Delete product                                                                       |
| `GET`    | `/api/v1/cart`                  | user  | Get cart (totals computed from live prices)                                          |
| `POST`   | `/api/v1/cart/items`            | user  | Add item (or increment), stock-checked                                               |
| `PATCH`  | `/api/v1/cart/items/:productId` | user  | Set quantity (≤ 0 removes)                                                           |
| `DELETE` | `/api/v1/cart/items/:productId` | user  | Remove item                                                                          |

**Response envelope**

```jsonc
// success
{ "success": true, "data": <payload>, "meta"?: { "page": 1, "limit": 12, "total": 30, "totalPages": 3 } }
// error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details"?: [...] } }
```

---

## Tests

```bash
# server — 19 tests (Jest + supertest + in-memory Mongo; no Docker needed)
cd server && npm test

# client — 13 tests (Vitest + React Testing Library)
cd client && npm test
```

Server tests cover auth (register/login/duplicate/invalid/`me`), cart (add/increment/update/remove,
stock enforcement, per-user isolation), products (search/filter/sort/pagination), and admin RBAC.
Client tests cover `CartItem`, `ProductCard` (incl. the auth gate), route guards (RBAC), and the
auth-change cache reset.

---

## Data model

| Collection   | Fields                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------ |
| **users**    | `email` (unique), `passwordHash`, `name`, `role` (`user`\|`admin`), `createdAt`            |
| **products** | `name`, `description`, `price`, `imageUrl`, `stock`, `createdAt`                           |
| **carts**    | `userId` (unique, ref users), `items[{ productId (ref products), quantity }]`, `updatedAt` |

The cart stores only `productId` + `quantity`; names/prices/totals are derived from the populated
product at read time, so a cart can never hold a stale price.

---

## Requirement traceability

| Requirement                               | Where                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Product listing page                      | `client/src/features/products/*`                                                                    |
| Cart sidebar: qty controls, total, remove | `client/src/features/cart/*`                                                                        |
| State management                          | Redux Toolkit + RTK Query (`client/src/app`, `features/*/*Api.ts`)                                  |
| REST APIs (products list, cart CRUD)      | `server/src/modules/{products,cart}/*`                                                              |
| Error handling + validation               | `server/src/middleware/{errorHandler,validate}.ts`; client `ErrorBoundary`/`ErrorBanner`/middleware |
| ≥ 2 MongoDB collections                   | users, products, carts (`server/src/models/*`)                                                      |
| TypeScript                                | both packages, strict mode                                                                          |
| Loading / error states                    | skeletons + `ErrorBanner` + `EmptyState` across features                                            |
| ≥ 2 unit tests                            | 19 server + 13 client                                                                               |
| Meaningful git commits                    | one stage per commit, conventional commits                                                          |
| README + assumptions                      | this file                                                                                           |

---

## Assumptions & scope

- **No checkout/payment** — the cart is the deliverable boundary.
- **Single short-lived JWT** — no refresh-token rotation or email verification (lean by design).
- **RBAC limited to product-catalog management** — admins manage the catalog; they do **not** view
  other users' carts (privacy).
- **Stock is checked but not reserved** — no concurrency locking.
- **Prices** are single-currency numbers (INR, formatted with `Intl.NumberFormat('en-IN')`); the
  stored value is currency-agnostic, and a paise-based integer money type would be the next hardening step.
- **Product images** use a placeholder image service.

---

## Author

**Yugma Gandhi** · yugmagandhi1805@gmail.com

Licensed under the MIT License.
