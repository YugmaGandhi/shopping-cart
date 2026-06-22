# Phase 1 — Backend (API, Auth, Cart, OpenAPI, Tests)

**Goal:** A fully working, validated, documented REST API backed by MongoDB: auth with
roles, product listing + admin CRUD, and cart operations — with a **consistent response
envelope**, centralized error handling, and tests.

**Exit checkpoint:** You review the API (via Swagger and/or curl) before frontend work.

---

## Stage 1.1 — Config & DB connection

- **Goal:** Validated env + resilient Mongoose connection.
- **Tasks:** `config/env.ts` parses `process.env` with Zod (fail fast on missing vars);
  `config/db.ts` connects Mongoose, logs, handles errors + graceful shutdown (SIGINT/SIGTERM).
- **Files:** `src/config/env.ts`, `src/config/db.ts`, wire into `server.ts`
- **Acceptance:** Server refuses to start on bad env; connects to Docker Mongo.
- **Commit:** `feat(server): add validated env config and MongoDB connection`

## Stage 1.2 — Mongoose models

- **Goal:** The three collections with indexes + types.
- **Tasks:** `User` (email unique, `role` enum default `user`, never return `passwordHash`),
  `Product`, `Cart` (`userId` unique, `items[{productId, quantity}]`, refs). Export TS types.
- **Files:** `src/models/{user,product,cart}.model.ts`
- **Acceptance:** Models compile; indexes declared; password hidden via `toJSON` transform.
- **Commit:** `feat(server): add Mongoose models for User, Product, Cart`

## Stage 1.3 — Common response model, error handling & validation

- **Goal:** One response shape across the entire API, enforced centrally.
- **Tasks:**
  - **Response envelope:** `utils/response.ts` → `sendSuccess(res, data, status=200, meta?)`
    emitting `{ success:true, data, meta? }`. No controller builds JSON by hand.
  - **Error envelope:** `ApiError` class (`statusCode`, `code`, `message`, `details?`);
    central `errorHandler` maps `ApiError`, Zod errors, and Mongoose dup-key/cast errors →
    `{ success:false, error:{ code, message, details? } }` with correct status.
  - Stable `error.code` constants (`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`,
    `NOT_FOUND`, `CONFLICT`, `INTERNAL`).
  - `asyncHandler` wrapper; `validate(schema)` middleware (body/params/query); `notFound` handler.
  - Wire `helmet`, `cors`, `morgan` into `app.ts`.
  - **API versioning:** a `src/routes/v1.ts` router aggregates all module routers and mounts
    at `/api/v1`; ops endpoints (`/api/health`, later `/api/docs`) stay unversioned.
- **Files:** `src/utils/{response,ApiError,asyncHandler}.ts`, `src/middleware/{errorHandler,validate,notFound}.ts`, `src/constants/errorCodes.ts`, `src/routes/v1.ts`
- **Acceptance:** Success routes return the success envelope; thrown `ApiError`/Zod errors
  return the error envelope with correct status + `code`. A unit test asserts both shapes.
- **Commit:** `feat(server): add standard response envelope, error handling, and validation`

## Stage 1.4 — Auth module + RBAC

- **Goal:** Register/login/me with JWT + role-aware guards.
- **Tasks:** Zod schemas (register/login); service hashes (bcrypt), issues JWT (`sub`, `role`);
  controller (uses `sendSuccess`); `auth` middleware (verify token → `req.user`);
  `requireRole('admin')`. Routes: `POST /register`, `POST /login`, `GET /me`.
- **Files:** `src/modules/auth/*`, `src/middleware/{auth,requireRole}.ts`, `src/schemas/auth.schema.ts`
- **Acceptance:** Register→login→/me works; bad creds 401; expired/invalid token 401 — all enveloped.
- **Commit:** `feat(server): add JWT auth with register, login, and role middleware`

## Stage 1.5 — Products module + admin CRUD + seed

- **Goal:** Public read with search/filter/sort/pagination, admin write, seeded catalog.
- **Tasks:** `GET /products` with a **Zod query schema** — `search` (case-insensitive name
  match), `sort` (`price_asc`|`price_desc`|`newest`), `minPrice`/`maxPrice`, `page` (default 1),
  `limit` (default 12, capped). Service builds the Mongo filter + sort + skip/limit and returns
  `meta: { page, limit, total, totalPages }` via `sendSuccess`. `GET /products/:id`;
  admin-guarded `POST/PATCH/DELETE` with Zod product schema. `scripts/seed.ts` seeds ~8–10
  products + 1 admin + 1 normal user.
- **Files:** `src/modules/products/*`, `src/schemas/product.schema.ts`, `scripts/seed.ts`
- **Acceptance:** List supports search/sort/price-range/pagination with correct `meta`;
  detail works (enveloped); non-admin write → 403; `npm run seed` populates DB.
- **Commit:** `feat(server): add products API with admin CRUD and seed script`

## Stage 1.6 — Cart module

- **Goal:** The core feature — cart CRUD with correct semantics.
- **Tasks:** `GET /cart` (find-or-create per user, **populate** products, compute `total`);
  `POST /cart/items` (add or increment, stock check); `PATCH /cart/items/:productId`
  (set qty; ≤0 removes); `DELETE /cart/items/:productId`. Cart service is pure/testable;
  all responses via `sendSuccess`.
- **Files:** `src/modules/cart/*`, `src/schemas/cart.schema.ts`
- **Acceptance:** Add twice → qty 2; patch to 0 removes; total matches populated prices; unauth 401.
- **Commit:** `feat(server): add cart API (get, add, update quantity, remove)`

## Stage 1.7 — OpenAPI registry (Zod → spec) + Swagger UI

- **Goal:** Spec generated from the same Zod schemas (no drift), documenting the envelope,
  served as interactive Swagger UI.
- **Tasks:** Register schemas + paths with `@asteasolutions/zod-to-openapi`; wrap each
  response in the success/error envelope components; build `openApiDocument` (servers,
  bearer-JWT security scheme). **Mount Swagger UI** (`swagger-ui-express`) at the
  unversioned `/api/docs`, plus a raw `/api/docs.json`. (Swagger UI was pulled forward from
  Phase 3 so the API can be explored interactively during backend work; the committed
  `openapi.json` artifact + README links remain in Phase 3.)
- **Files:** `src/docs/openapi.ts`, `src/app.ts` (mount), register calls
- **Acceptance:** `openApiDocument` is valid OpenAPI 3, all routes covered, responses show
  the envelope; `GET /api/docs` serves Swagger UI and `GET /api/docs.json` the raw spec.
- **Commit:** `feat(server): generate OpenAPI spec from Zod and serve Swagger UI`

## Stage 1.8 — Backend tests

- **Goal:** ≥2 meaningful tests on critical paths (target: cart + auth/RBAC + envelope).
- **Tasks:** Jest + supertest + `mongodb-memory-server`. Tests: (1) add item increments on
  repeat; (2) update qty + remove; (3) add invalid product → 4xx with error envelope;
  (4) admin guard 403 for non-admin; (5) success responses match the envelope shape;
  (6) product search/filter/pagination returns the right subset + `meta`.
- **Files:** `tests/cart.test.ts`, `tests/products.admin.test.ts`, `tests/products.query.test.ts`, test setup/teardown
- **Acceptance:** `npm test` green; no real DB needed.
- **Commit:** `test(server): add cart and admin-authorization integration tests`

---

### Phase 1 exit criteria — ✅ COMPLETE

- [x] All endpoints implemented + validated, every response in the standard envelope
- [x] Errors return `{ success:false, error:{ code, message, details? } }` with correct status
- [x] RBAC enforced on product writes; admins cannot touch user carts
- [x] OpenAPI document builds from Zod and documents the envelope; Swagger UI live at `/api/docs`
- [x] Tests green (19 tests / 5 suites via mongodb-memory-server); seed works
