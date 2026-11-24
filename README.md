# Mini Gauntlet frontend

React, TypeScript and Tailwind CSS frontend for Mini Gauntlet. It uses the FastAPI
backend for scans, saved history, scores, check definitions and findings. There is
no demo mode or substitute scan data.

## Run the complete application with Docker

The frontend is included under `frontend/` in the same repository as the API.
Start Docker Desktop, stop local dev servers using ports 3000/8000, and run from
the repository root:

```sh
docker compose up --build -d --wait
```

Open **http://localhost:3000**. The same command starts FastAPI, PostgreSQL and
Adminer. Database migrations run automatically. Host Node/Python installations
and `.env.local` are not needed for Docker execution.

The frontend Dockerfile builds with pinned Node `22.19.0-alpine`, then copies only
`dist/` into pinned `nginx-unprivileged:1.28.0-alpine`. Nginx runs as UID/GID 101 on
container port 8080, published as localhost:3000. Its `/healthz` endpoint supplies
the container health check. `nginx.conf` proxies `/api/` to FastAPI, preserving paths.
The Docker build sets `VITE_API_BASE_URL` to an empty string for same-origin requests.
Local environment files are excluded by `.dockerignore`.

```sh
# From Gauntlet-api:
docker compose ps
docker compose logs --tail=100 frontend
docker compose down
```

Database data is retained unless the volume is explicitly removed. For the database
viewer and full setup details, see the [API README](../README.md).

## Local development prerequisites

- Node.js 22 and npm.
- The API and PostgreSQL running; follow Option B in the [API setup](../README.md).
- Stop the Docker frontend before running Vite: from `Gauntlet-api`, run
  `docker compose stop frontend`. Both use host port 3000.

On macOS with Homebrew, install Node if needed:

```sh
brew install node@22
export PATH="$(brew --prefix node@22)/bin:$PATH"
node --version
npm --version
```

The PATH command applies to the current terminal; repeat it in a new terminal if
Node is not otherwise on your PATH.

## Install and run

Open a separate terminal for the frontend. From the repository root:

```sh
cd frontend
npm ci
# First setup only; preserve an existing .env.local:
cp .env.example .env.local
npm run dev
```

The `.env.local` file should contain:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Open **http://127.0.0.1:3000**. Leave the dev-server terminal running. Restart Vite
after changing `.env.local`; frontend environment values are read at startup/build.
If port 3000 is occupied, stop the old frontend process. A different frontend port
also needs to be allowed by the API's `CORS_ORIGINS`.

If npm 10 fails with an `edgesOut` dependency-resolution error, use
`npx --yes npm@11 install`, then run `npm run dev` again.

For later sessions, run `npm run dev` from this directory. Stop it with Ctrl+C.

## Use the application

1. Click **Get started** on the home screen.
2. Click **Run security scan**. All inventory accounts across AWS, Azure and Google
   Cloud are included automatically; no provider selection is required.
3. Watch the loading state until the background scan finishes, then view scores,
   account summaries and findings. Use filters and pagination to inspect results.
4. Expand **Scan history**, which starts collapsed, to reopen saved scans. Expand
   **Security check catalog** to see the registered checks.
5. Toggle **API activity** to inspect actual requests, parameters, status and timing.

The workspace is `/#/scans`; saved results use `/#/scans/{id}`. Detail links survive
refresh and support browser back/forward. Polling stops when scans complete or fail.
All findings and scores come from the API; inventory strings are rendered as text.

## Verify and build

```sh
npm run lint
npm test
npm run typecheck
npm run build
# Serve the generated dist/ build locally:
npm run preview
```

Stop the dev server before previewing if it is using port 3000. The backend must
remain running for the preview to load data. `preview` is a local build check,
not a production hosting service.

If the page reports a connection error, confirm http://localhost:8000/api/health
returns `{"status":"ok"}`, verify `VITE_API_BASE_URL`, and check the API's CORS origins.

## Main files

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Navigation, scan lifecycle, polling and detail loading |
| `src/lib/api.ts` | Centralized real HTTP requests and activity events |
| `src/components/ScanLauncher.tsx` | Start a scan for all accounts |
| `src/components/ScanHistory.tsx` | Collapsible persisted history |
| `src/components/Results.tsx` | Scores, account summaries, filters and findings |
| `src/components/CheckCatalog.tsx` | Backend check definitions |
| `src/components/ApiDrawer.tsx` | Request log drawer |
| `src/lib/types.ts` | API types and original inventory account display labels |

Frontend Docker packaging and the root GitHub Actions workflow are implemented. AI coding assistance was used
for development and verification.

ESLint checks TypeScript and the runtime React Hooks rules with zero warnings.
CI installs from the lockfile and runs `npm run lint`, `npm run typecheck`,
`npm test` and `npm run build`. The workflow and manual repository setup are
documented in the [root README](../README.md).
