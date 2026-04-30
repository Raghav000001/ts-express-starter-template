# Architecture

## Application Lifecycle

### Startup Sequence

```
1. Import config/index.ts  →  dotenv.config() runs (side effect)
2. const app = express()   →  Express 5 app created
3. app.use(attachCorelationId)  →  Correlation ID middleware registered
4. app.use("/api/v1", v1Router) →  V1 routes mounted
5. app.use("/api/v2", v2Router) →  V2 routes mounted
6. app.use(genericErrorHandler) →  Global error handler (must be last)
7. app.listen(PORT)             →  Server starts
```

All of this happens in `src/server.ts`. There is no separate `app.ts` — the app cannot be imported for testing without starting the HTTP listener.

### Request Flow

```
Client Request
  │
  ▼
attachCorelationId          ← Generates UUID, wraps request in AsyncLocalStorage
  │
  ▼
Router Match (/api/v1/...)  ← Express routes the request
  │
  ▼
Controller Handler          ← Business logic, may throw errors
  │
  ├── Success → res.json() / res.send()
  │
  └── Error thrown
        │
        ▼
      genericErrorHandler   ← Catches error, logs it, returns JSON error response
```

## Middleware Chain

Middleware is registered in `server.ts` in this order:

| Order | Middleware | File | Purpose |
|-------|-----------|------|---------|
| 1 | `attachCorelationId` | `middlewares/corelation.middleware.ts` | Assigns UUID, creates `AsyncLocalStorage` context |
| 2 | Route handlers | `routes/v1/`, `routes/v2/` | Endpoint logic |
| 3 | `genericErrorHandler` | `middlewares/error.middleware.ts` | Catches all errors, returns structured JSON |

### What's Missing

- **`express.json()`** is not registered. `req.body` will be `undefined` for all requests. Must be added before routes if you need to handle JSON request bodies.
- **`express.urlencoded()`** is not registered either.

## Error Handling

### Error Interface

```typescript
// src/errors/app.errors.ts
interface AppError extends Error {
    statusCode: number
}
```

### Custom Error Classes

The project defines two error classes that **implement** `AppError` (rather than **extending** `Error`):

| Class | Status Code | Note |
|-------|-------------|------|
| `internalServerError` | 500 | camelCase name (unconventional) |
| `badRequest` | 400 | camelCase name (unconventional) |

Both classes manually define `statusCode`, `message`, and `name` properties in their constructors. Because they don't extend `Error`, they **lack stack traces**.

### Error Handler Middleware

`genericErrorHandler` in `src/middlewares/error.middleware.ts`:

1. Logs the error via Winston (includes correlation ID automatically)
2. Responds with `{ success: false, message: err.message }` and `err.statusCode` as HTTP status

Express 5 automatically forwards thrown errors (including from async handlers) to the error handler. No manual `try/catch` + `next(err)` is needed.

### Adding a New Error Type

```typescript
// src/errors/app.errors.ts
export class notFound implements AppError {
    statusCode: number
    message: string
    name: string

    constructor(message: string) {
        this.statusCode = 404
        this.message = message
        this.name = "not found"
    }
}
```

## Correlation IDs

The correlation ID system provides per-request tracing across all log output.

### How It Works

```
                        attachCorelationId middleware
                               │
                               ├── 1. uuid.v4() generates unique ID
                               ├── 2. Sets req.headers['correlation-id']
                               └── 3. asyncStorage.run({correlationId: id}, next)
                                       │
                                       ▼
                            Request enters AsyncLocalStorage context
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
   Controller                    Any nested call              Winston logger
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       │
                              getCorrelationId()
                        reads from asyncStorage.getStore()
                     returns UUID or "unknown error" fallback
```

### Components

| Component | File | Role |
|-----------|------|------|
| `asyncStorage` | `helpers/request.helper.ts` | `AsyncLocalStorage` instance shared across the app |
| `getCorrelationId()` | `helpers/request.helper.ts` | Retrieves current request's correlation ID from the store |
| `attachCorelationId` | `middlewares/corelation.middleware.ts` | Middleware that creates the context per request |
| Winston `printf` format | `config/logger.config.ts` | Injects `correlationId` into every log entry |

### Key Detail

`AsyncLocalStorage.run()` creates an execution context that follows the entire async call chain. This means any code that runs during a request — controllers, services, database calls — can access the correlation ID via `getCorrelationId()` without it being passed as a parameter.

## API Versioning

Routes are organized by version:

```
src/routes/
├── v1/
│   ├── index.routes.ts    ← Aggregator: mounts all v1 sub-routers
│   └── ping.routes.ts     ← GET /api/v1/ping
└── v2/
    ├── index.router.ts    ← Aggregator: mounts all v2 sub-routers
    └── health.routes.ts   ← GET /api/v2/health
```

Each version directory has an index file that aggregates sub-routers. These are mounted in `server.ts`:

```typescript
app.use("/api/v1", v1Router)
app.use("/api/v2", v2Router)
```

### Adding a New API Version

1. Create `src/routes/v3/`
2. Create `src/routes/v3/index.routes.ts` with a `Router()` that mounts sub-routers
3. Import and mount in `server.ts`: `app.use("/api/v3", v3Router)`
