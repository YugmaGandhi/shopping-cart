# Phase 3 — Documentation, QA & Delivery

**Goal:** Make the project trivially runnable from a clean clone, expose live API docs,
prove quality with a full QA pass, and ship to GitHub with a clean history.

**Exit checkpoint:** Final review, then GitHub link delivered.

---

## Stage 3.1 — Committed spec artifact

- **Goal:** A committed, Postman-importable `openapi.json` artifact.
- **Note:** Swagger UI itself was pulled forward to **Stage 1.7** and is already live at
  `GET /api/docs` (+ raw `GET /api/docs.json`). This stage now only adds the committed file.
- **Tasks:** Add an `openapi:gen` script that writes `server/openapi.json` from the Phase-1
  `buildOpenApiDocument()`. Commit the generated file (Postman-importable).
- **Files:** `server/openapi.json`, `server/scripts/generate-openapi.ts`, `package.json` script
- **Acceptance:** `openapi.json` committed and matches the live `/api/docs.json`.
- **Commit:** `chore(server): export committed openapi.json artifact`

## Stage 3.2 — README (root)

- **Goal:** One document to run everything.
- **Tasks:** Sections — overview & features; architecture diagram (text); tech stack;
  prerequisites (Node 22 via nvm, Docker); **setup** (clone → `nvm use` → Mongo via Docker
  → server `.env` + install + seed + dev → client `.env` + install + dev); **env var**
  tables; **API reference** table + `/api/docs` link + Postman import note; **test**
  commands; **default credentials** (seeded admin + user); **project structure**;
  **requirement traceability** table (brief → where satisfied); **assumptions**.
- **Files:** `README.md`
- **Acceptance:** A fresh reader can boot both apps using only the README.
- **Commit:** `docs: add comprehensive README with setup, API, and assumptions`

## Stage 3.3 — Assumptions & decisions note

- **Goal:** Capture intentional scope boundaries + key choices.
- **Tasks:** Short `docs/DECISIONS.md` (or README section): why RTK Query, why shadcn,
  why envelope, why RBAC limited to catalog (no admin-views-cart), lean JWT, stock-not-reserved.
- **Files:** `docs/DECISIONS.md`
- **Acceptance:** Each non-obvious choice has a one-line rationale.
- **Commit:** `docs: document architectural decisions and assumptions`

## Stage 3.4 — QA pass

- **Goal:** Prove the Definition of Done.
- **Tasks:** Run `typecheck` + `lint` + `test` on both packages; fix any issues.
  Manual smoke test from clean clone: seed → register/login → browse → add/update/remove →
  verify total → admin create/edit/delete → logout. Verify error states (stop API → UI shows error).
- **Files:** any fixes
- **Acceptance:** All green; smoke test passes; error states verified.
- **Commit:** `chore: lint, type, and test fixes from QA pass` (only if changes needed)

## Stage 3.5 — GitHub delivery

- **Goal:** Public repo with clean history + working link.
- **Tasks:** Confirm `.env` never committed; review commit history reads as a story;
  install `gh` (or use provided remote); create repo; push `main`. Optionally tag `v1.0.0`.
- **Files:** n/a
- **Acceptance:** Repo accessible; clone → README → runs. Link delivered.
- **Commit:** n/a (push)

---

### Phase 3 exit criteria

- [ ] `/api/docs` live; `openapi.json` committed + Postman-importable
- [ ] README runs the app from scratch; traceability table present
- [ ] All checks green; manual smoke test passed
- [ ] Pushed to GitHub; history clean; no secrets committed
