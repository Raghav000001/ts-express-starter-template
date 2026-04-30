# Getting Started

## Prerequisites

- **Node.js** >= 18 (for native ESM + `AsyncLocalStorage` support)
- **npm** >= 9

## Installation

```bash
# Clone the repository
git clone https://github.com/Raghav000001/ts-express-starter-template.git
cd ts-express-starter-template

# Install dependencies
npm install
```

## Environment Setup

Copy the sample environment file and set your port:

```bash
cp sample.env .env
```

Edit `.env`:

```env
PORT=3000
```

If `PORT` is not set, the server defaults to **3000**.

## Running the Development Server

```bash
npm run dev
```

This runs `nodemon src/server.ts`, which uses `ts-node` under the hood to execute TypeScript directly. The server hot-reloads on file changes.

You should see:

```
app is running on port 3000
```

## Verifying the Setup

Test the ping endpoint:

```bash
curl http://localhost:3000/api/v1/ping
# Response: pong
```

Test the health endpoint:

```bash
curl http://localhost:3000/api/v2/health
# Response: {"message":"app is running all good and fine"}
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with hot-reload via nodemon |

> **Note:** The README mentions `npm run build` and `npm start` — these do **not** exist. The project is development-only; there is no production build pipeline. See [Configuration](./configuration.md#typescript) for details on why.

## Project Layout

```
ts-express-starter-template/
├── docs/               # Documentation (you are here)
├── logs/               # Auto-created by Winston (gitignored)
├── src/                # All source code
│   ├── config/         # Environment + logger config
│   ├── controllers/    # Request handlers
│   ├── errors/         # Custom error classes
│   ├── helpers/        # Utility modules (AsyncLocalStorage)
│   ├── middlewares/    # Express middleware
│   ├── routes/         # API route definitions (v1, v2)
│   ├── validators/     # Zod validation schemas
│   └── server.ts       # Application entry point
├── sample.env          # Environment variable template
├── tsconfig.json       # TypeScript compiler configuration
└── package.json        # Dependencies and scripts
```

## Next Steps

- [Configuration](./configuration.md) — environment variables, TypeScript settings, logger setup
- [API Reference](./api-reference.md) — endpoint documentation
- [Architecture](./architecture.md) — request flow, middleware chain, error handling
- [Module Reference](./modules.md) — every function, type, and export explained
