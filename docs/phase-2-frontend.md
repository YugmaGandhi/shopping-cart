# Phase 2 — Frontend (Redux/RTK Query, Design System, Cart & Admin UI, Tests)

**Goal:** A polished React app: product listing, cart sidebar with quantity controls and
totals, auth flows, and a minimal admin product UI — all state via Redux Toolkit + RTK
Query, all forms via React Hook Form + Zod, all UI via Tailwind tokens + shadcn/ui.

**Exit checkpoint:** You review the running UI before delivery.

---

## Stage 2.1 — Store, RTK Query base & envelope unwrapping

- **Goal:** Typed Redux store + API layer that speaks our response envelope.
- **Tasks:** `app/store.ts` (configureStore); typed `useAppDispatch`/`useAppSelector`.
  `features/api/apiSlice.ts` with `fetchBaseQuery` (baseUrl from `VITE_API_URL`,
  `prepareHeaders` injects `Authorization: Bearer`). A shared `transformResponse` /
  base-query wrapper **unwraps `data`** and surfaces `error.error.code/message` consistently.
  Tag types: `Product`, `Cart`.
- **Files:** `src/app/store.ts`, `src/app/hooks.ts`, `src/features/api/apiSlice.ts`
- **Acceptance:** Store wired into `Provider`; a probe query returns unwrapped data.
- **Commit:** `feat(client): configure Redux store and RTK Query base with envelope unwrapping`

## Stage 2.2 — Design system: tokens + shadcn components

- **Goal:** The component vocabulary the features need.
- **Tasks:** Finalize design tokens (light theme; optional dark). Add shadcn components:
  `button`, `card`, `input`, `label`, `form`, `sheet`, `dialog`, `badge`, `skeleton`,
  `sonner` (toasts), `table`, `dropdown-menu`. Confirm `Form` wraps React Hook Form.
- **Files:** `src/components/ui/*`, `src/index.css` (tokens)
- **Acceptance:** Components render token-styled; `Form` integrates RHF `Controller`.
- **Commit:** `feat(client): add design tokens and shadcn/ui component set`

## Stage 2.3 — App-level error handling

- **Goal:** Resilient, consistent error UX app-wide (not just per-feature).
- **Tasks:**
  - `ErrorBoundary` (class component + fallback UI with a reset action) wrapping `<App/>` —
    catches render-time crashes instead of white-screening.
  - Reusable `ErrorBanner` (message + retry) and `EmptyState` components in `components/`.
  - `NotFound` page + router `errorElement` for unmatched/failed routes.
  - RTK Query error middleware (`isRejectedWithValue`): `401` → force logout + redirect to
    `/login`; network/`5xx` → toast. Cross-cutting errors handled once, centrally.
- **Files:** `src/components/{ErrorBoundary,ErrorBanner,EmptyState,NotFound}.tsx`, `src/app/errorMiddleware.ts`
- **Acceptance:** Throwing in a child renders the boundary fallback; a `401` auto-logs-out;
  unknown route shows 404; a failed query shows banner + retry.
- **Commit:** `feat(client): add app-level error handling (boundary, middleware, 404)`

## Stage 2.4 — App shell, routing & guards

- **Goal:** Layout + navigation + route protection.
- **Tasks:** React Router routes: `/` (products), `/login`, `/register`, `/admin`.
  `Layout` with header (brand [lucide icon, no emoji], cart trigger, auth-aware user menu/logout).
  `ProtectedRoute` (requires auth) and `AdminRoute` (requires `role==='admin'`, nested in ProtectedRoute).
  **`authSlice` (token + user state, localStorage-persisted, rehydrated) is built here** because the
  guards depend on it; Stage 2.5 adds the auth API + forms that populate it. `errorMiddleware` 401
  handler updated to dispatch `logout()` (soft redirect via guards) now that the slice exists.
  Feature pages are stubs (EmptyState) replaced in 2.5/2.6/2.8.
- **Files:** `src/routes/*`, `src/components/{Layout,Header}.tsx`, `src/features/auth/authSlice.ts`, stub pages
- **Acceptance:** Unauthed → redirected from protected routes; `/admin` hidden for non-admins.
- **Commit:** `feat(client): add app shell, routing, and route guards`

## Stage 2.5 — Auth feature (RHF + Zod)

- **Goal:** Login/register with shared validation + token persistence.
- **Tasks:** (`authSlice` already built in 2.4.)
  `authApi` (login/register/me mutations/queries) populating the slice via `setCredentials`.
  Login + Register forms via RHF +
  `zodResolver` using **schemas shared in shape with the server** (`lib/validation`).
  Loading/disabled states; error toasts from envelope `error.message`.
- **Files:** `src/features/auth/*`, `src/lib/validation/auth.ts`
- **Acceptance:** Register→auto-login→redirected; invalid creds show enveloped error; refresh keeps session.
- **Commit:** `feat(client): add auth with React Hook Form, Zod, and token persistence`

## Stage 2.6 — Products feature (with search, sort & pagination)

- **Goal:** Product listing with search/filter/sort/pagination and proper loading/error/empty states.
- **Tasks:** `productsApi` (getProducts accepting `{search,sort,minPrice,maxPrice,page,limit}` as
  query args so RTK Query caches per query; getProduct). `ProductList` (grid) + `ProductCard`
  (image placeholder, name, price, Add-to-Cart). **Debounced search input** + **sort dropdown**
  (+ optional price-range) in a products toolbar, driving the query args. **Pagination** control
  reading `meta` from the response. `Skeleton` while loading; reuse the shared `ErrorBanner`
  (retry) and `EmptyState` ("no results") from Stage 2.3. Add-to-Cart triggers cart mutation + toast.
- **Files:** `src/features/products/*`
- **Acceptance:** Search/sort/price/pagination update the list via API; loading shows skeletons;
  error shows retry; empty search shows EmptyState; add works.
- **Commit:** `feat(client): add product listing with search, sort, pagination, and states`

## Stage 2.7 — Cart feature (the core)

- **Goal:** Cart sidebar with quantity controls, totals, and remove.
- **Tasks:** `cartApi` (getCart/addItem/updateQty/removeItem) with **tag invalidation** +
  optimistic updates for qty changes. `CartSidebar` in a shadcn `Sheet` triggered from
  header. `CartItem` (image, name, price, +/- controls, remove). Live `total`, item count
  badge, empty-cart `EmptyState`, per-row pending state, `ErrorBanner` on load failure.
- **Files:** `src/features/cart/*`
- **Acceptance:** Add/increment/decrement/remove reflect immediately; total correct; qty 0 removes; badge updates.
- **Commit:** `feat(client): add cart sidebar with quantity controls, totals, and remove`

## Stage 2.8 — Minimal admin UI

- **Goal:** Make RBAC visible — admin-only product management.
- **Tasks:** `/admin` (AdminRoute): product `Table` with edit/delete; create/edit `Dialog`
  with RHF + `zodResolver` product form (reuses server-shaped schema); delete confirm.
  Mutations invalidate `Product` tag so the catalog refreshes.
- **Files:** `src/features/admin/*`, `src/lib/validation/product.ts`
- **Acceptance:** Admin can create/edit/delete products and see catalog update; non-admin can't reach `/admin`.
- **Commit:** `feat(client): add minimal admin product management UI`

## Stage 2.9 — Frontend tests

- **Goal:** ≥2 unit tests on critical components.
- **Tasks:** Vitest + RTL + jsdom. (1) `CartItem`: increment/decrement fire the right
  handlers and render quantity; (2) `ProductCard`: Add-to-Cart triggers the mutation;
  (3) cart total renders correctly from items. Mock RTK Query where needed.
- **Files:** `src/tests/CartItem.test.tsx`, `src/tests/ProductCard.test.tsx`, test setup
- **Acceptance:** `npm test` green.
- **Commit:** `test(client): add unit tests for CartItem and ProductCard`

---

### Phase 2 exit criteria — ✅ COMPLETE

- [x] Product list + cart sidebar fully functional with loading/error/empty states
- [x] App-level error handling in place: ErrorBoundary, 404 page, centralized 401→logout middleware
- [x] Reusable `ErrorBanner` / `EmptyState` used across features (no ad-hoc error UI)
- [x] All state via RTK / RTK Query; forms via RHF + Zod
- [x] Admin UI gated by role; normal users can't access it
- [x] Tests green (13 tests / 4 suites, Vitest + RTL: CartItem, ProductCard, route guards, auth-cache reset); typecheck + lint clean
- [x] Verified zero runtime console errors via headless Chrome across all flows
