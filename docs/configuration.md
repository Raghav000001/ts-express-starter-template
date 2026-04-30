# Configuration

## Environment Variables

Environment variables are loaded from `.env` via `dotenv` at application startup.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | `3000` | HTTP server listen port |

The template file is `sample.env` in the project root. Copy it to `.env` before running.

### Adding New Environment Variables

1. Add the variable to `sample.env` as documentation
2. Add the type to the `Config` type in `src/config/index.ts`
3. Add the value (with a default fallback) to the `serverConfig` object

```typescript
// src/config/index.ts
type Config = {
    PORT: number,
    DATABASE_URL: string,  // add type here
}

export const serverConfig: Config = {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL || "",  // add value here
}
```

### How Config Loading Works

`src/config/index.ts` calls `loadConfig()` at **module top-level** (import-time side effect). This means `dotenv.config()` runs as soon as any module imports from `config/index.ts`. The `serverConfig` object is then populated from `process.env`.

```
Module import → loadConfig() → dotenv.config() → serverConfig populated
```

## TypeScript Configuration

Key settings in `tsconfig.json` and their implications:

| Setting | Value | Implication |
|---------|-------|-------------|
| `module` | `nodenext` | Native ESM resolution; imports require `.ts` extensions |
| `target` | `esnext` | Latest JavaScript features allowed |
| `strict` | `true` | All strict type checking enabled |
| `verbatimModuleSyntax` | `true` | Must use `import type` for type-only imports |
| `noUncheckedIndexedAccess` | `true` | Index access returns `T \| undefined` — always handle undefined |
| `exactOptionalPropertyTypes` | `true` | Cannot assign `undefined` to optional properties unless explicitly typed |
| `emitDeclarationOnly` | `true` | `tsc` only produces `.d.ts` files, not runnable JS |
| `allowImportingTsExtensions` | `true` | `.ts` extensions in import paths are valid |
| `types` | `[]` | Auto-type inclusion disabled — `@types/node` etc. not auto-loaded |
| `isolatedModules` | `true` | Per-file compilation; no `const enum` or cross-file type inference |

### Why There's No Production Build

The combination of `emitDeclarationOnly: true` and `allowImportingTsExtensions: true` means:

- `tsc` only emits type declarations (`.d.ts`), not JavaScript
- Import paths contain `.ts` extensions, which Node.js cannot resolve in plain JS output
- The project runs **exclusively** through `ts-node` / `nodemon` in development

To add a production build, you would need to either:
- Remove both settings and switch imports to `.js` extensions
- Use a bundler like `tsup` or `esbuild` that handles `.ts` extension rewriting

## Logger Configuration

Winston is configured in `src/config/logger.config.ts` with two transports:

### Console Transport

Outputs JSON-formatted logs to stdout. Each log entry includes:

```json
{
  "timestamp": "04-30-2026 14:30:00",
  "level": "info",
  "message": "some message",
  "data": {},
  "correlationId": "a1b2c3d4-..."
}
```

### File Transport (Daily Rotation)

| Setting | Value |
|---------|-------|
| Filename pattern | `logs/-%DATE%-app.log` |
| Date pattern | `YYYY-MM-DD-HH` |
| Max file size | 20 MB |
| Max retention | 14 days |

Log files are written to the `logs/` directory, which is gitignored and auto-created by Winston on first write.

### Correlation ID Injection

Every log entry automatically includes a `correlationId` field. This is pulled from `AsyncLocalStorage` (see [Architecture](./architecture.md#correlation-ids)) without needing to pass it manually. Any `logger.info()`, `logger.error()`, etc. call within a request's execution context will include the request's correlation ID.

### Usage

```typescript
import logger from "../config/logger.config.ts"

logger.info("User created")
logger.error("Something failed")
logger.warn("Deprecated endpoint called")
```
