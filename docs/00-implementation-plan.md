# Shopping Cart — Master Implementation Plan

> Production-grade implementation of a shopping cart feature for an e-commerce app.
> This is the **index** document. Each phase has its own detailed document, and every
> phase is broken down into **stages** (each stage ≈ one git commit).

## 1. Objective

Deliver a full-stack shopping cart: product listing, cart management (add / update qty /
remove / total), with JWT auth + roles, a typed REST API documented via OpenAPI, and
MongoDB persistence — built to a production standard in code organization, state
management, API design, schema design, testing, and git hygiene.

## 2. Final stack decisions

| Layer          | Choice                                                                                | Why                                                                    |
| -------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Runtime        | **Node 22.22.3** (pinned via `.nvmrc` + `engines`)                                    | LTS, reproducible                                                      |
| Language       | **TypeScript** (client & server)                                                      | Type safety end-to-end                                                 |
| Frontend build | **Vite 7 + React 18**                                                                 | Fast, modern; clean `npm audit` (Vite 5 carried dev-server advisories) |
| State / data   | **Redux Toolkit + RTK Query**                                                         | Auto loading/error/caching                                             |
| Forms          | **React Hook Form + Zod resolver**                                                    | Perf + shared validation schemas                                       |
| Styling        | **Tailwind CSS + design tokens (CSS variables)**                                      | Token-driven, themeable                                                |
| UI components  | **shadcn/ui (Radix primitives)**                                                      | Headless, state-agnostic, token-native, owned in-repo                  |
| Backend        | **Express + TypeScript**                                                              | Layered routes→controller→service                                      |
| ODM            | **Mongoose 8**                                                                        | Schemas, indexes, populate                                             |
| Auth           | **JWT access token + bcrypt + role (user/admin)**                                     | Lean RBAC, no refresh rotation                                         |
| Validation     | **Zod**                                                                               | Type-safe; single source for validation + OpenAPI                      |
| API docs       | **Swagger UI from Zod** (`@asteasolutions/zod-to-openapi`) + committed `openapi.json` | No drift; Postman-importable                                           |
| DB             | **MongoDB via Docker**                                                                | No host install; reproducible                                          |
| Backend tests  | **Jest + supertest + mongodb-memory-server**                                          | No real DB needed                                                      |
| Frontend tests | **Vitest + React Testing Library**                                                    | Vite-native                                                            |

## 3. Repository structure (single GitHub repo)

```
shopping-cart/
├── docs/                    # these planning documents
├── server/
│   ├── src/
│   │   ├── config/          # env (zod), db connection
│   │   ├── models/          # User, Product, Cart
│   │   ├── middleware/      # auth, requireRole, validate, errorHandler
│   │   ├── modules/         # auth/, products/, cart/ (routes+controller+service)
│   │   ├── schemas/         # Zod request schemas (shared shape with client)
│   │   ├── docs/            # OpenAPI registry + swagger setup
│   │   └── utils/           # ApiError, asyncHandler, response helpers
│   ├── scripts/seed.ts
│   └── tests/
├── client/
│   └── src/
│       ├── app/             # store, hooks
│       ├── features/        # api/, auth/, products/, cart/, admin/
│       ├── components/      # ui/ (shadcn), shared
│       ├── routes/          # ProtectedRoute, AdminRoute
│       ├── lib/             # validation schemas, utils
│       └── tests/
├── docker-compose.yml
├── .nvmrc
├── .gitignore
└── README.md
```

## 4. Data model

| Collection   | Fields                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **users**    | `_id, email (unique idx), passwordHash, name, role ('user'\|'admin', default 'user'), createdAt` |
| **products** | `_id, name, description, price, imageUrl, stock, createdAt`                                      |
| **carts**    | `_id, userId (unique idx, ref users), items[{ productId (ref products), quantity }], updatedAt`  |

Cart stores only `productId` + `quantity`; name/price are **populated** at read time so the
cart can never hold a stale price. Totals computed from live product data.

## 5. API contract

**Versioning:** all resource routes are mounted under **`/api/v1`** (a single versioned
router; bumping to `/api/v2` later means a new router, old one untouched). Operational
endpoints — `/api/health`, `/api/docs` — are intentionally **unversioned**.

```
POST   /api/v1/auth/register              {name,email,password} → {token, user}
POST   /api/v1/auth/login                 {email,password}      → {token, user}
GET    /api/v1/auth/me           (auth)                         → user

GET    /api/v1/products          ?search&sort&minPrice&maxPrice&page&limit → Product[] + meta
GET    /api/v1/products/:id                                     → Product
POST   /api/v1/products          (admin) {…product}             → Product
PATCH  /api/v1/products/:id      (admin) {…partial}             → Product
DELETE /api/v1/products/:id      (admin)                        → 204

GET    /api/v1/cart              (auth)                          → { items[], total }
POST   /api/v1/cart/items        (auth) {productId, quantity}    → cart
PATCH  /api/v1/cart/items/:productId (auth) {quantity}           → cart
DELETE /api/v1/cart/items/:productId (auth)                      → cart
```

**Product query params** (all optional, validated by a Zod query schema):
`search` (case-insensitive name match), `sort` (`price_asc`|`price_desc`|`newest`),
`minPrice`/`maxPrice`, `page` (default 1), `limit` (default 12, capped). The list response
returns pagination in `meta`: `{ page, limit, total, totalPages }`.

**Standard response envelope (every endpoint):**

```jsonc
// Success — status 200/201 (204 = no body)
{ "success": true, "data": <payload>, "meta"?: { ... } }
// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details"?: [...] } }
```

Enforced by a `sendSuccess()` helper + the central `errorHandler`; no route hand-rolls its
own shape. OpenAPI documents the wrapped shape.

**Conventions:**

- Status codes: `400` validation, `401` unauth, `403` forbidden, `404` not found,
  `409` conflict, `500` fallback. Each maps to a stable `error.code` string.
- Adding an existing product **increments** quantity. PATCH qty ≤ 0 **removes** the item.
  Stock validated on add/update. Admin routes guarded by `requireRole('admin')`.

## 6. Conventions

- **Commits:** Conventional Commits (`feat`/`fix`/`chore`/`test`/`docs`/`refactor`), scoped
  `(server)`/`(client)`. One commit per stage; each builds & passes its stage. Co-authored trailer.
- **Branching:** `main` for the project; phases may use short-lived branches → PR if we want PR history.
- **Each stage** documents: goal → tasks → files → acceptance criteria → commit message.

## 7. Phase overview

| Phase | Document                                         | Focus                                                                             | Status         |
| ----- | ------------------------------------------------ | --------------------------------------------------------------------------------- | -------------- |
| **0** | [phase-0-foundation.md](./phase-0-foundation.md) | Repo, tooling, Docker, scaffolds                                                  | ✅ Complete    |
| **1** | [phase-1-backend.md](./phase-1-backend.md)       | Models, auth+roles, products+admin CRUD, cart, errors, OpenAPI, Swagger UI, tests | ✅ Complete    |
| **2** | [phase-2-frontend.md](./phase-2-frontend.md)     | Store, design system, error handling, auth, products, cart UI, admin UI, tests    | ✅ Complete    |
| **3** | [phase-3-delivery.md](./phase-3-delivery.md)     | README, openapi.json artifact, QA, GitHub push                                    | ⏳ In progress |

We pause at the end of each phase for explicit approval before continuing.

## 8. Global Definition of Done

- [ ] `npm run typecheck` + `npm run lint` clean on both packages
- [ ] All tests green (≥2 backend, ≥2 frontend)
- [ ] App runs end-to-end from a clean clone following only the README
- [ ] Every assignment requirement traceable to code (see traceability table in README)
- [ ] Clean, meaningful conventional-commit history
- [ ] Live API docs at `/api/docs`; `openapi.json` committed
- [ ] README documents setup + API + assumptions

## 9. Assumptions (also in final README)

- No checkout / payment / order flow — cart is the deliverable boundary.
- Single short-lived JWT access token; no refresh rotation or email verification (lean by design).
- RBAC limited to admin product-catalog management; admins do **not** view user carts (privacy).
- Cart never persists price — always derived from current product data.
- Stock checked but not reserved (no concurrency locking).
- Single currency (USD); prices stored as numbers (cents-based = next hardening step).
- Placeholder product images via a static image service.

## 10. Time budget (4–6h target)

| Phase          | Est.   |
| -------------- | ------ |
| 0 — Foundation | 0.5–1h |
| 1 — Backend    | 2–2.5h |
| 2 — Frontend   | 2–2.5h |
| 3 — Delivery   | 0.75h  |
