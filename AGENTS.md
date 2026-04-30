# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-30
**Commit:** f480fd1
**Branch:** main

## OVERVIEW

Express 5 + TypeScript REST API starter template. ESM-only, runs via `ts-node`/`nodemon` — no production build path exists. Uses Zod 4 for validation, Winston for structured logging with per-request correlation IDs via `AsyncLocalStorage`.

## STRUCTURE

```
src/
├── config/         # dotenv loader (index.ts), Winston logger (logger.config.ts)
├── controllers/    # Request handlers: ping, health
├── errors/         # AppError interface + custom error classes
├── helpers/        # AsyncLocalStorage for correlation ID propagation
├── middlewares/    # correlation ID, global error handler, Zod validation (unused)
├── routes/
│   ├── v1/         # /api/v1/ping
│   └── v2/         # /api/v2/health
├── validators/     # Zod schemas (unused — userValidatorSchema never imported)
└── server.ts       # Single entry point: app creation + middleware + routes + listen()
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new route | `src/routes/vN/` | Create `thing.routes.ts` + add to `index.routes.ts` aggregator |
| Add controller | `src/controllers/` | Named export at bottom: `export { handler }` |
| Add middleware | `src/middlewares/` | `kebab.middleware.ts`, register in `server.ts` |
| Add validation | `src/validators/` | Zod schema, wire via `validate()` from `zod.middleware.ts` |
| Add error type | `src/errors/app.errors.ts` | Implements `AppError` (note: doesn't extend `Error`) |
| Change config | `src/config/index.ts` | Add to `Config` type + `serverConfig` object |
| Change logging | `src/config/logger.config.ts` | Winston transports/format |

## CONVENTIONS

### Imports
- **ESM only** — never `require()`
- `.ts` extensions required in all imports: `import x from "./foo.ts"`
- `import type { X }` for type-only imports (`verbatimModuleSyntax: true`)

### File Naming
- `kebab-case.category.ts` — category is: `controller`, `middleware`, `routes`, `config`, `helper`, `errors`
- **Inconsistency**: v1 uses `index.routes.ts`, v2 uses `index.router.ts` — prefer `.routes.ts`

### Code Style
- Double quotes, no consistent semicolons (mixed across files)
- `const` + arrow functions for handlers/middleware
- Controllers: named export block at bottom (`export { handlerName }`)
- Routers: `export default router`
- No linter/formatter configured

### Architecture
- API versioned: routes under `routes/v1/`, `routes/v2/`, mounted at `/api/vN`
- Route pattern: `Router()` → `.route("/").get(handler)` → `export default router`
- Error flow: controller throws custom error → `genericErrorHandler` catches → JSON response `{ success: false, message }`
- Correlation IDs: `AsyncLocalStorage` wraps every request, Winston auto-injects ID into all logs

### TypeScript
- `strict: true` with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- `emitDeclarationOnly: true` — tsc produces only `.d.ts`, not runnable JS
- `types: []` — auto-type inclusion disabled

## ANTI-PATTERNS (THIS PROJECT)

- Error classes use `implements AppError` instead of `extends Error` — no stack traces
- Error class names are camelCase (`internalServerError`, `badRequest`) — breaks JS class convention
- `express.json()` middleware is NOT registered — `req.body` is always `undefined`
- `zod.middleware.ts` and `validators/validator.ts` exist but are never imported/used
- `ping.routes.ts` line 1: `import Router from "express"` (default import) — should be `import { Router } from "express"`
- `catch (error: any)` in `zod.middleware.ts` — type safety bypassed
- `getCorrelationId()` returns `"unknown error"` for missing ID — misleading fallback string
- `console.log` used for startup message instead of the configured Winston logger

## KNOWN ISSUES

- **No production build**: `emitDeclarationOnly` + `allowImportingTsExtensions` = cannot compile to runnable JS. Dev-only via `nodemon`/`ts-node`.
- **README lies**: Claims `npm run build` and `npm start` exist — they don't. Only `npm run dev` works.
- **package.json `main`**: Points to `index.js` which doesn't exist. Entry is `src/server.ts`.
- **package.json `name`**: `advance-backend` doesn't match repo name.
- **`sample.env` vs `.env.example`**: README references `.env.example` but file is `sample.env`.
- **Typo**: `corelation` throughout (filename, function names) — should be `correlation`. Header is spelled correctly.
- **No app/server split**: Can't import app for testing without starting the listener.

## COMMANDS

```bash
npm run dev          # nodemon src/server.ts (only available script)
```

## NOTES

- **Express 5** (not 4) — async error handling built-in, API differences from v4
- **Zod 4** (not 3) — breaking API changes from v3
- Logs written to `logs/` with daily rotation (14d retention, 20MB/file) — dir auto-created by Winston
- TODO in `logger.config.ts:31` — planned MongoDB log transport
- No tests, no CI, no Dockerfile, no ESLint/Prettier
