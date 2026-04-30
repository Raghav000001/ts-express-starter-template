# Module Reference

Complete reference of every source file, its exports, types, and usage.

---

## `src/server.ts`

**Role:** Application entry point. Creates Express app, registers middleware, mounts routes, starts HTTP listener.

**Exports:** None (side-effect module)

**Boot sequence:**
1. Registers `attachCorelationId` middleware
2. Mounts v1 routes at `/api/v1`
3. Mounts v2 routes at `/api/v2`
4. Registers `genericErrorHandler`
5. Calls `app.listen()` on configured port

---

## `src/config/index.ts`

**Role:** Centralized configuration loading from environment variables.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `loadConfig` | `() => void` | Calls `dotenv.config()` to load `.env` into `process.env` |
| `serverConfig` | `Config` | Configuration object with resolved values |

### Types

```typescript
type Config = {
    PORT: number
}
```

### Behavior

`loadConfig()` is called at **module top level** (line 15). Importing anything from this module triggers `.env` loading as a side effect.

### `serverConfig` Properties

| Property | Type | Default | Source |
|----------|------|---------|--------|
| `PORT` | `number` | `3000` | `process.env.PORT` |

---

## `src/config/logger.config.ts`

**Role:** Winston logger factory with JSON format, correlation ID injection, and daily file rotation.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `default` (logger) | `winston.Logger` | Pre-configured Winston logger instance |

### Usage

```typescript
import logger from "../config/logger.config.ts"

logger.info("User created")
logger.error("Request failed")
logger.warn("Deprecated endpoint hit")
```

Every log entry is JSON-formatted with fields: `timestamp`, `level`, `message`, `data`, `correlationId`.

### Transports

| Transport | Output | Configuration |
|-----------|--------|---------------|
| `Console` | stdout | JSON format |
| `DailyRotateFile` | `logs/-%DATE%-app.log` | 20MB max size, 14 day retention, hourly rotation pattern |

---

## `src/errors/app.errors.ts`

**Role:** Custom error types for structured error responses.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `AppError` | `interface` | Error shape with `statusCode` (extends `Error`) |
| `internalServerError` | `class` | 500 error — implements `AppError` |
| `badRequest` | `class` | 400 error — implements `AppError` |

### `AppError` Interface

```typescript
interface AppError extends Error {
    statusCode: number
}
```

### `internalServerError`

```typescript
new internalServerError(message: string)
```

| Property | Value |
|----------|-------|
| `statusCode` | `500` |
| `name` | `"internal server error"` |
| `message` | Provided in constructor |

### `badRequest`

```typescript
new badRequest(message: string)
```

| Property | Value |
|----------|-------|
| `statusCode` | `400` |
| `name` | `"bad request"` |
| `message` | Provided in constructor |

### Usage

```typescript
import { badRequest, internalServerError } from "../errors/app.errors.ts"

throw new badRequest("email is required")
throw new internalServerError("database connection failed")
```

---

## `src/helpers/request.helper.ts`

**Role:** `AsyncLocalStorage` instance for per-request context (correlation IDs).

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `asyncStorage` | `AsyncLocalStorage<AsyncLocalStorageType>` | Shared storage instance for request context |
| `getCorrelationId` | `() => string \| undefined` | Retrieves the current request's correlation ID from the async store |

### Types

```typescript
type AsyncLocalStorageType = {
    correlationId: string
}
```

### `asyncStorage`

The `AsyncLocalStorage` instance shared across the application. The correlation middleware calls `asyncStorage.run()` to establish request context; the logger reads from it via `getCorrelationId()`.

### `getCorrelationId()`

```typescript
getCorrelationId(): string | undefined
```

- Returns the `correlationId` from the current async context
- Returns `"unknown error"` if no correlation ID is found (misleading fallback)
- Returns `undefined` if an exception occurs while reading the store

---

## `src/middlewares/corelation.middleware.ts`

**Role:** Express middleware that assigns a unique correlation ID to each incoming request.

> **Note:** Filename is misspelled — "corelation" should be "correlation".

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `attachCorelationId` | `(req, res, next) => void` | Middleware function |

### Behavior

1. Generates a UUID v4
2. Sets `req.headers['correlation-id']` to the generated ID
3. Calls `asyncStorage.run({ correlationId: id }, next)` — wraps the rest of the request in an `AsyncLocalStorage` context

### Usage

Registered globally in `server.ts`:

```typescript
app.use(attachCorelationId)
```

---

## `src/middlewares/error.middleware.ts`

**Role:** Global Express error handler. Must be registered **after** all routes.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `genericErrorHandler` | `(err, req, res, next) => void` | Express error-handling middleware |

### Behavior

1. Logs the error object via Winston (`logger.error(err)`)
2. Responds with HTTP status from `err.statusCode`
3. Returns JSON: `{ success: false, message: err.message }`

### Usage

Registered last in `server.ts`:

```typescript
app.use(genericErrorHandler)
```

---

## `src/middlewares/zod.middleware.ts`

**Role:** Factory function that creates Express middleware for Zod schema validation.

> **Note:** Currently unused — not imported in any route file.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `validate` | `(schema: ZodObject) => Middleware` | Returns middleware that validates `req.body` against the given Zod schema |

### `validate(schema)`

```typescript
validate(schema: ZodObject): (req, res, next) => Promise<void>
```

**Success:** Parses `req.body` with `schema.parseAsync()`, replaces `req.body` with parsed result, calls `next()`.

**Validation failure (ZodError):**

```json
Status: 400
{ "success": false, "errors": [{ "field": "email", "message": "invalid email" }] }
```

**Other error:**

```json
Status: 500
{ "success": false, "message": "internal server error" }
```

### Usage

```typescript
import { validate } from "../../middlewares/zod.middleware.ts"
import { userValidatorSchema } from "../../validators/validator.ts"

router.route("/users").post(validate(userValidatorSchema), handler)
```

> **Prerequisite:** `express.json()` must be registered before routes for `req.body` to be populated.

---

## `src/validators/validator.ts`

**Role:** Zod validation schemas for request data.

> **Note:** Currently unused — not imported anywhere.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `userValidatorSchema` | `ZodObject` | Schema for user registration/login payloads |

### Schema Definition

```typescript
userValidatorSchema = z.object({
    email: z.string().trim().toLowerCase().email("invalid email address"),
    password: z.string().trim()
        .min(5, "password must be at least 5 characters")
        .max(20, "pass can not be bigger than 20 characters")
})
```

### Validated Shape

| Field | Type | Rules |
|-------|------|-------|
| `email` | `string` | Required, trimmed, lowercased, valid email format |
| `password` | `string` | Required, trimmed, 5-20 characters |

---

## `src/controllers/ping.controller.ts`

**Role:** Handler for the ping/connectivity check endpoint.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `pingHandler` | `(req: Request, res: Response) => void` | Returns "pong" as plain text |

### Behavior

Sends `"pong"` with 200 status (Express default) using `res.send()`.

### Route

`GET /api/v1/ping` via `src/routes/v1/ping.routes.ts`

---

## `src/controllers/health.controller.ts`

**Role:** Handler for the application health check endpoint.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `healthHandler` | `(req: Request, res: Response) => Promise<void>` | Returns health status as JSON |

### Behavior

- **Success:** Returns `{ message: "app is running all good and fine" }` with 200 status
- **Error:** Throws `internalServerError("error in health handler")` which is caught by `genericErrorHandler`

### Route

`GET /api/v2/health` via `src/routes/v2/health.routes.ts`

---

## `src/routes/v1/index.routes.ts`

**Role:** Route aggregator for API version 1.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `default` (v1Router) | `Router` | Express Router mounting all v1 sub-routes |

### Mounted Sub-Routes

| Path | Router | Endpoint |
|------|--------|----------|
| `/ping` | `pingRouter` | `GET /api/v1/ping` |

---

## `src/routes/v1/ping.routes.ts`

**Role:** Route definition for the ping endpoint.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `default` (pingRouter) | `Router` | Router with `GET /` → `pingHandler` |

> **Bug:** Line 1 uses `import Router from "express"` (default import of entire express module) instead of `import { Router } from "express"`. Works by coincidence since `express()` has a `.route()` method.

---

## `src/routes/v2/index.router.ts`

**Role:** Route aggregator for API version 2.

> **Note:** Filename uses `.router.ts` instead of `.routes.ts` (inconsistent with v1).

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `default` (v2Router) | `Router` | Express Router mounting all v2 sub-routes |

### Mounted Sub-Routes

| Path | Router | Endpoint |
|------|--------|----------|
| `/health` | `healthRouter` | `GET /api/v2/health` |

---

## `src/routes/v2/health.routes.ts`

**Role:** Route definition for the health check endpoint.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `default` (healthRouter) | `Router` | Router with `GET /` → `healthHandler` |
