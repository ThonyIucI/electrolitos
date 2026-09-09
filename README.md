# Electrolitos

App de la academia Amautas: asistencia, XP, casas, medallas y tablero en vivo para el taller
de electrónica. PWA mobile-first con look de juego.

Plan, contrato de API y decisiones: `../planning/` (empezar por `README.md`).
Configuración de Cloudflare y GitHub: `../planning/CLOUDFLARE_SETUP.md`.

## Stack

| Parte | Tecnología | Dónde corre |
|---|---|---|
| `apps/web` | Vite + React 19 + TanStack Router + Tailwind v4 + shadcn | Cloudflare Pages |
| `apps/server` | Hono + Drizzle + better-auth | Cloudflare Workers |
| Base de datos | Cloudflare D1 (SQLite) | Cloudflare |
| `packages/shared` | Enums, tipos de API y utilidades compartidas back/front | — |
| `packages/db` | Schema Drizzle + migraciones generadas | — |
| `packages/auth` | Configuración de better-auth (email para staff, username para alumnos) | — |
| `packages/ui` | Primitivas shadcn compartidas y `globals.css` (tokens) | — |

Requiere **Node 24** (`nvm use 24`) y **pnpm 12**.

## Desarrollo local

Todo corre en tu máquina, sin Cloudflare: la API en wrangler con una D1 local (archivo SQLite
en `apps/server/.wrangler/state/`) y el front en Vite.

```bash
nvm use 24
pnpm install
pnpm db:migrate:local      # crea/actualiza la D1 local. Idempotente, corre las que falten
pnpm dev                   # API http://localhost:3000 · web http://localhost:3001
```

Primera vez: copiar `apps/server/.dev.vars.example` → `apps/server/.dev.vars` (ya existe en esta
máquina) y crear el admin:

```bash
curl -X POST localhost:3000/api/v1/internal/seed-admin \
  -H "x-seed-token: seed-local-dev-token" -H "content-type: application/json" \
  -d '{"email":"admin@electrolitos.local","password":"admin12345","name":"Thony"}'
```

> Ya existe un admin local `admin@electrolitos.local` / `admin12345`. Entrar en
> http://localhost:3001/login.

### Probar desde el celular (misma red Wi-Fi)

1. Levanta todo con `pnpm dev`. Vite imprime una línea `Network: http://192.168.x.x:3001`.
   Si no la ves, tu IP sale con `hostname -I`.
2. En el celular abre `http://<esa-ip>:3001`. Nada más: el front llama a la API por el mismo
   origen (`/api`) y Vite la reenvía a wrangler, así no hay CORS ni problemas de cookies.
3. Si no carga, es el firewall del PC: `sudo ufw allow 3001/tcp` (y `3000/tcp` si quieres
   pegarle a la API directo).

Cómo funciona por dentro: `apps/web/.env` tiene `VITE_SERVER_URL=/` (mismo origen) y
`apps/web/vite.config.ts` hace proxy de `/api` → `localhost:3000`. En producción la variable
apunta a la URL del Worker y no hay proxy. Las cookies son `Lax` en HTTP local y
`None; Secure` en HTTPS de producción (se decide por el esquema de `BETTER_AUTH_URL`).

## Migraciones

1. Editar el schema en `packages/db/src/schema/*.ts`
2. `pnpm db:generate` → crea el SQL en `packages/db/src/migrations/` (**nunca** escribirlo a mano)
3. `pnpm db:migrate:local` en desarrollo · `pnpm db:migrate:remote` en producción

## Tests

```bash
pnpm --filter server test       # vitest dentro de workerd con D1 en memoria
pnpm check-types
```

## Deploy

```bash
pnpm --filter server exec wrangler secret put BETTER_AUTH_SECRET
pnpm --filter server exec wrangler secret put SEED_TOKEN
pnpm db:migrate:remote
pnpm deploy:server              # → https://electrolitos-api.electrolitos.workers.dev
```

El front se publica solo desde Cloudflare Pages en cada push a `main`
(build `pnpm --filter web build`, output `apps/web/dist`, var `VITE_SERVER_URL`).

## Convenciones

Ver `../CLAUDE.md`. Resumen: rutas → handler → query Drizzle, sin capas extra; zod en entrada;
sobre `{ success, data, error }` en salida; `xp_events` append-only; mensajes de error en
español sin IDs; un componente por archivo; sin barrels.
