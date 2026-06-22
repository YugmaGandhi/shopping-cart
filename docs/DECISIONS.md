# Architecture Decisions

Short rationale for the non-obvious choices in this project. These were decided up front (see the
phase docs) and refined during review.

## API & backend

- **Single response envelope** (`{ success, data, meta? }` / `{ success, error: { code, message, details? } }`)
  on every endpoint. A predictable shape lets the client unwrap data and handle errors in one place
  (`baseQuery` + central `errorHandler`) instead of per-call. Stable `error.code` strings make the
  client resilient to message wording changes.
- **Centralized error handling.** Controllers throw `ApiError` (or let Zod/Mongoose errors bubble);
  one `errorHandler` maps everything to the envelope with the right status. No try/catch per route
  (an `asyncHandler` forwards async rejections).
- **API versioning (`/api/v1`).** Resource routes live under a versioned router so a future breaking
  change can ship as `/api/v2` without touching v1. Operational routes (`/api/health`, `/api/docs`)
  are intentionally unversioned.
- **OpenAPI generated from the same Zod schemas** (`@asteasolutions/zod-to-openapi`). The validation
  schema is the single source of truth, so the docs can't drift from what the API actually accepts.
  Swagger UI was wired in early (not at delivery) so the API could be exercised before any client code.
- **Explicit Mongoose document interfaces** instead of `InferSchemaType`. Inference silently degrades
  every field to `unknown` once a schema uses a `toJSON.transform` that deletes keys (which we need to
  hide `passwordHash`). Explicit interfaces keep types reliable — and it's Mongoose's own recommendation.
- **Cart stores only `productId` + `quantity`.** Names/prices/totals are derived from the populated
  product at read time, so a cart can never hold a stale price.

## Auth & access control

- **Lean JWT** — a single short-lived access token, no refresh-token rotation or email verification.
  Appropriate for the assignment's scope; refresh rotation would be the next step for production.
- **RBAC limited to product-catalog management.** Admins create/edit/delete products. Admins do **not**
  view other users' carts — a cart is private to its owner, so exposing it to admins would be a privacy
  anti-pattern, not a feature.
- **Stock is checked but not reserved.** Add/update validate against current stock, but there's no
  hold/locking. True reservation needs concurrency control (transactions/locks) beyond this scope.

## Frontend

- **Redux Toolkit + RTK Query.** RTK Query gives caching, request dedup, and automatic
  loading/error/refetch state, removing most hand-written data-fetching boilerplate. Feature endpoints
  are injected into one `apiSlice` so the store stays cohesive.
- **Cache reset on auth change.** Logging in/out dispatches `resetApiState()` so a new session never
  shows a previous user's cached cart. (Caught in review; now covered by a regression test.)
- **Optimistic cart updates.** Quantity changes and removals patch the cached cart immediately and roll
  back on error, so the UI feels instant while staying correct.
- **Tailwind design tokens + shadcn/ui.** Tokens (CSS variables) keep theming centralized; shadcn
  components are owned in-repo (not a black-box dependency), built on accessible Radix primitives.
  Icons come from `lucide-react` — no emoji as icons.
- **React Hook Form + Zod**, with client schemas kept in shape with the server's, so validation rules
  match end to end and forms get typed values.
- **Prices formatted as INR** via `Intl.NumberFormat('en-IN')`. Stored values are currency-agnostic
  numbers; formatting is display-only (no conversion).

## Tooling

- **husky + lint-staged pre-commit guard.** Runs format + lint on staged files and a typecheck per
  affected package, so unformatted or type-erroring code can't be committed. The hook also loads the
  `.nvmrc` Node version, since ESLint 9 requires Node 18+.
- **mongodb-memory-server for backend tests.** Real Mongo behavior (indexes, populate, validation)
  without requiring Docker in CI, and isolated per run.
