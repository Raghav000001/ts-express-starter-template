# ⚡ Express TypeScript Starter

A minimal, production-ready starter template for building scalable REST APIs with **Express** and **TypeScript** — zero boilerplate, full type safety, hot-reload out of the box.

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Raghav000001/ts-express-starter-template.git
```

> Want a custom project name?
> ```bash
> git clone https://github.com/Raghav000001/ts-express-starter-template.git my-project
> cd my-project
> ```

### 2. Navigate to the project directory

```bash
cd Express-Typescript-Starter-Project
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

```bash
echo "PORT=3000" > .env
```

> See [`.env.example`](.env.example) for all available options.

### 5. Start the development server

```bash
npm run dev
```

The server will be running at `http://localhost:3000` with hot-reload enabled. ✅

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Express](https://expressjs.com/) | Web framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety & DX |
| [ts-node-dev](https://github.com/wclr/ts-node-dev) | Hot-reload in development |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |

---

## 📁 Project Structure

```
├── src/
│   ├── routes/         # Route definitions
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   └── index.ts        # App entry point
├── .env                # Local environment variables (git-ignored)
├── .env.example        # Environment variable template
├── tsconfig.json       # TypeScript configuration
└── package.json
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled production build |

---


## 📄 License

This project is licensed under the [MIT License](LICENSE).
