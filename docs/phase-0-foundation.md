# Phase 0 — Project Foundation & Tooling

**Goal:** A clean monorepo that builds, lints, type-checks, runs a health endpoint, renders
a blank React app with Tailwind/shadcn wired, and has MongoDB reachable via Docker — before
any feature code exists.

**Exit checkpoint:** You review the repo structure and confirm both apps boot.

---

## Stage 0.1 — Repo & monorepo skeleton

- **Goal:** Version control + top-level layout + reproducible Node version.
- **Tasks:**
  - `git init`; create `client/` and `server/` dirs.
  - Add `.nvmrc` (`22.22.3`), root `.gitignore` (node_modules, dist, .env, coverage), `.editorconfig`.
  - Root `README.md` stub (title + “setup coming”).
- **Files:** `.nvmrc`, `.gitignore`, `.editorconfig`, `README.md`
- **Acceptance:** `git status` clean intent; `node -v` matches `.nvmrc`.
- **Commit:** `chore: initialize monorepo with tooling config and node version pin`

## Stage 0.2 — MongoDB via Docker

- **Goal:** Reproducible database with zero host install.
- **Tasks:**
  - `docker-compose.yml` with `mongo:7`, named volume, port `27017`.
  - Document raw `docker run` fallback (compose plugin missing on this host).
  - Verify connection (`docker compose up -d` or `docker run`, then ping).
- **Files:** `docker-compose.yml`
- **Acceptance:** Mongo container runs; reachable on `mongodb://localhost:27017`.
- **Commit:** `chore: add docker-compose for local MongoDB`

## Stage 0.3 — Server scaffold

- **Goal:** Express + TypeScript app that boots with a health route.
- **Tasks:**
  - `npm init`; deps: `express`, `mongoose`, `zod`, `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`, `morgan`, `dotenv`.
  - devDeps: `typescript`, `tsx`, `@types/*`, `eslint`, `prettier`, `jest`, `ts-jest`/`vitest`, `supertest`, `mongodb-memory-server`.
  - `tsconfig.json` (strict), ESLint + Prettier config, `engines.node`.
  - `src/app.ts` (express app, **no listen** — testable) + `src/server.ts` (bootstrap+listen).
  - `GET /api/health` → `{ status: 'ok' }`. Scripts: `dev`, `build`, `start`, `lint`, `format`, `format:check`, `typecheck`, `test`.
- **Files:** `server/package.json`, `server/tsconfig.json`, `server/.eslintrc`, `server/src/app.ts`, `server/src/server.ts`
- **Acceptance:** `npm run dev` serves health; `npm run typecheck`+`lint` clean.
- **Commit:** `chore(server): scaffold Express + TypeScript with health endpoint`

## Stage 0.4 — Client scaffold + design system base

- **Goal:** Vite React TS app with Tailwind, design tokens, and shadcn initialized.
- **Tasks:**
  - Scaffold Vite (`react-ts`). Add Tailwind + PostCSS; configure `tailwind.config.ts` content paths.
  - Define **design tokens** as CSS variables in `index.css` (`--background`, `--foreground`, `--primary`, `--radius`, etc.); map into Tailwind theme.
  - `shadcn init` (style, base color, CSS variables = yes). Add `Button` to prove the pipeline.
  - ESLint + Prettier; path alias `@/`. Scripts: `dev`, `build`, `lint`, `format`, `format:check`, `typecheck`, `test`.
- **Files:** `client/package.json`, `client/vite.config.ts`, `client/tailwind.config.ts`, `client/src/index.css`, `client/components.json`, `client/src/components/ui/button.tsx`
- **Acceptance:** `npm run dev` renders a shadcn Button styled by tokens; typecheck+lint clean.
- **Commit:** `chore(client): scaffold Vite React TS with Tailwind tokens and shadcn/ui`

## Stage 0.5 — Shared conventions & env

- **Goal:** Documented env contract + consistent response/error shape stubs.
- **Tasks:**
  - `server/.env.example` (`PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`).
  - `client/.env.example` (`VITE_API_URL`).
  - `server/src/utils/ApiError.ts` + `asyncHandler.ts` stubs; error-shape doc note.
- **Files:** `server/.env.example`, `client/.env.example`, `server/src/utils/*`
- **Acceptance:** `.env.example` documents every var the apps read.
- **Commit:** `chore: add env templates and shared error/response utilities`

## Stage 0.6 — Commit guard (husky + lint-staged)

- **Goal:** Make it impossible to commit unformatted code or lint/type errors.
- **Tasks:**
  - Install `husky` + `lint-staged` at the **repo root** (where `.git` lives); `npm run prepare` installs the git hooks.
  - `lint-staged` config: on staged `*.{ts,tsx}` run `eslint --fix` + `prettier --write`; on other staged files run `prettier --write`. Scoped per package (`client/`, `server/`).
  - `.husky/pre-commit` first loads the project's `.nvmrc` Node version via nvm (the hook otherwise inherits the shell's default Node, and ESLint 9 needs Node 18+), then runs `lint-staged`, then a full `typecheck` for each package that has staged changes (tsc is whole-project, not per-file), aborting the commit on any failure.
- **Files:** root `package.json` (private, workspaces-aware scripts), `.husky/pre-commit`, root `.lintstagedrc` (or `lint-staged` field)
- **Acceptance:** A commit with a type error or unformatted file is **blocked**; a clean commit passes; staged files get auto-formatted.
- **Commit:** `chore: add husky + lint-staged pre-commit guard for format, lint, and types`

---

### Phase 0 exit criteria — ✅ COMPLETE

- [x] Both apps boot (`health` route + shadcn Button page)
- [x] Mongo reachable via Docker
- [x] typecheck + lint + format:check clean on both
- [x] Pre-commit hook blocks unformatted / type-erroring commits
- [x] 6 commits present; `.env.example` complete
