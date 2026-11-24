# Mini Gauntlet frontend

Independent React, TypeScript and Tailwind CSS dashboard. It connects directly to
the backend URL supplied in the frontend environment file. No API repository,
submodule, Docker network hostname or embedded demo results are required to build
and run this frontend.

## Run locally

Use Node.js 22 and npm. In this frontend directory:

```sh
npm ci
# Save the separately supplied frontend environment file as .env.local first.
npm run dev
```

Open http://127.0.0.1:3000. Set `VITE_API_BASE_URL` in your local environment file to
your backend's browser-accessible base URL, without appending `/api`. Configuration
values are supplied separately and are not included here. Restart Vite after changing
the file. The backend's CORS configuration must allow the frontend's browser origin.

## Run independently with Docker

Export `VITE_API_BASE_URL` from the separately supplied configuration before building:

```sh
docker build --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" -t gauntlet-ui .
docker run --rm -p 127.0.0.1:3000:8080 gauntlet-ui
```

The URL is embedded at build time; rebuild after changing it. The build requires a
nonempty URL. Nginx serves compiled assets as a non-root user and exposes `/healthz`
for the container health check. It does not proxy API requests or resolve a container
named `api`. Keep environment files out of Git; frontend build-time variables are
visible in the browser bundle and must not contain secrets.

## Use the dashboard

- Get started, then run one scan across all inventory accounts.
- View scores, account summaries, findings, filters and pagination after completion.
- Expand initially collapsed scan history to reopen saved results.
- Expand the check catalog or toggle the API request drawer.
- Saved detail URLs survive refresh. Loading, empty and error states use real API
  responses, with no fallback findings.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

The frontend's own `.github/workflows/ci.yml` runs these checks and builds its Docker
image on pushes and pull requests. Preview requires a running backend; stop the dev
server first if port 3000 is occupied.

Backend setup and security rules are documented in the
[API repository](https://github.com/deepz2002/Gauntlet-api).

## AI coding assistance

I supplied the UI requirements and directed the all-cloud scan flow, skeleton loading,
collapsible history and API drawer. I used OpenAI Codex as a coding tool to implement
components, API requests, tests and container configuration, and to help debug them.
The assignment supplies the security rules; scores and findings come from the backend.
Full disclosure is in the API repository's DEVELOPMENT_NOTES.md.
