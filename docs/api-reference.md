# API Reference

## Base URL

```
http://localhost:{PORT}
```

Default port: `3000`

## API Versioning

Routes are versioned under `/api/v1`, `/api/v2`, etc. Each version has its own router aggregator in `src/routes/vN/`.

---

## Endpoints

### `GET /api/v1/ping`

Health-check / connectivity test.

**Handler:** `pingHandler` in `src/controllers/ping.controller.ts`

**Request:**
- No parameters
- No body required

**Response:**

```
Status: 200 OK
Content-Type: text/html

pong
```

---

### `GET /api/v2/health`

Application health status endpoint.

**Handler:** `healthHandler` in `src/controllers/health.controller.ts`

**Request:**
- No parameters
- No body required

**Response (success):**

```json
Status: 200 OK
Content-Type: application/json

{
  "message": "app is running all good and fine"
}
```

**Response (error):**

```json
Status: 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "message": "error in health handler"
}
```

---

## Error Response Format

All errors handled by the global error handler follow this format:

```json
{
  "success": false,
  "message": "description of what went wrong"
}
```

The HTTP status code is set from the error's `statusCode` property.

### Available Error Types

| Error Class | Status Code | Import |
|-------------|-------------|--------|
| `internalServerError` | 500 | `import { internalServerError } from "../errors/app.errors.ts"` |
| `badRequest` | 400 | `import { badRequest } from "../errors/app.errors.ts"` |

### Throwing Errors in Controllers

```typescript
import { badRequest } from "../errors/app.errors.ts"

const myHandler = async (req: Request, res: Response) => {
    if (!req.query.id) {
        throw new badRequest("id is required")
    }
    // Express 5 automatically catches async throws
    // and forwards them to genericErrorHandler
}
```

---

## Validation (Available but Unused)

A Zod validation middleware exists at `src/middlewares/zod.middleware.ts` but is not currently wired into any routes.

### Validation Error Response Format

When validation is wired in, failed requests return:

```json
Status: 400 Bad Request

{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "invalid email address"
    },
    {
      "field": "password",
      "message": "password must be at least 5 characters"
    }
  ]
}
```

### Wiring Validation to a Route

```typescript
import { validate } from "../../middlewares/zod.middleware.ts"
import { userValidatorSchema } from "../../validators/validator.ts"

router.route("/users").post(validate(userValidatorSchema), createUserHandler)
```

> **Important:** You must also register `express.json()` middleware in `server.ts` before routes for `req.body` parsing to work. It is currently **not registered**.

---

## Request Headers

### Correlation ID

Every request is automatically assigned a `correlation-id` header (UUID v4) by the correlation middleware. This ID is:

- Set on `req.headers['correlation-id']`
- Stored in `AsyncLocalStorage` for the request's lifetime
- Automatically included in all Winston log entries during that request

You can read the correlation ID in any handler:

```typescript
const correlationId = req.headers['correlation-id']
```

## Adding a New Endpoint

1. Create a controller in `src/controllers/`:

```typescript
// src/controllers/users.controller.ts
import type { Request, Response } from "express"

const listUsersHandler = async (req: Request, res: Response) => {
    res.status(200).json({ users: [] })
}

export { listUsersHandler }
```

2. Create a route file in `src/routes/vN/`:

```typescript
// src/routes/v1/users.routes.ts
import { Router } from "express"
import { listUsersHandler } from "../../controllers/users.controller.ts"

const usersRouter = Router()
usersRouter.route("/").get(listUsersHandler)

export default usersRouter
```

3. Register in the version's index aggregator:

```typescript
// src/routes/v1/index.routes.ts
import usersRouter from "./users.routes.ts"

v1Router.use("/users", usersRouter)
```
