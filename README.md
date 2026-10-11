# Electrolitos

App de la academia Amautas: asistencia, XP, coins, grupos y tablero en vivo para el taller
de electrónica. PWA mobile-first con look de juego.

| | Local | Producción |
|---|---|---|
| Front | http://localhost:3008 | https://electrolitos.gaiamundo.com |
| API | http://localhost:3009 | https://electrolitos-api.gaiamundo.com |

## Stack

| Parte | Tecnología | Dónde corre |
|---|---|---|
| `apps/web` | Vite + React 19 + TanStack Router + Tailwind v4 + shadcn | Cloudflare Pages |
| `apps/server` | Hono + Drizzle + better-auth | Cloudflare Workers |
| Base de datos | Cloudflare D1 (SQLite) | Cloudflare |
| `packages/shared` | Enums, tipos de API y utilidades compartidas back/front | — |
| `packages/db` | Schema Drizzle + migraciones generadas | — |
| `packages/auth` | Configuración de better-auth | — |
| `packages/ui` | Primitivas shadcn compartidas y `globals.css` (tokens) | — |

Requiere **Node 24** (`nvm use 24`) y **pnpm 12**.

---

## Levantar en local

```bash
nvm use 24
pnpm install
pnpm db:migrate:local      # crea/actualiza las tablas de la base local. Idempotente
pnpm dev                   # front 3008 · API 3009
```

`pnpm dev` levanta los dos servidores en paralelo; Ctrl+C mata a ambos. Por separado:
`pnpm dev:web` y `pnpm dev:server`.

### Crear tu usuario local

La base local arranca vacía. Los secrets están en `apps/server/.dev.vars` (copiar de
`.dev.vars.example` si no existe):

```bash
curl -X POST localhost:3009/api/v1/internal/seed-admin \
  -H "x-seed-token: seed-local-dev-token" -H "content-type: application/json" \
  -d '{"email":"admin@electrolitos.local","password":"admin12345","name":"Thony"}'
```

Y entras en http://localhost:3008/login con ese correo.

> Local y producción **no comparten nada**: ni base, ni usuarios, ni secrets. El admin que
> creas acá no existe allá. Detalle en [docs/entornos.md](docs/entornos.md).

---

## Comandos

| Qué | Comando |
|---|---|
| Levantar todo | `pnpm dev` |
| Tests del servidor | `pnpm --filter server test` |
| Revisar tipos | `pnpm check-types` |
| Generar una migración | `pnpm db:generate` |
| Aplicarla en local | `pnpm db:migrate:local` |
| Aplicarla en producción | `pnpm db:migrate:remote` |
| Desplegar la API | `pnpm deploy:server` |
| Desplegar el front | `pnpm deploy:web` |

El schema vive en `packages/db/src/schema/*.ts`. El SQL **nunca** se escribe a mano: se
edita el schema y se corre `pnpm db:generate`.

---

## Desplegar

Los dos comandos publican desde tu terminal con la sesión de `wrangler login`. **El orden
importa**: primero la base, después el código.

```bash
pnpm db:migrate:remote     # si hubo migraciones nuevas
pnpm deploy:server         # API
pnpm deploy:web            # front
```

Desplegar solo el front deja la web nueva hablándole a una API vieja, y las pantallas que
usan rutas nuevas responden `404 Recurso no encontrado`.

Paso a paso, secrets y configuración de dominio: [docs/despliegue.md](docs/despliegue.md).

---

## Documentación

| Documento | De qué trata |
|---|---|
| [docs/entornos.md](docs/entornos.md) | Local vs producción, el `database_id`, probar desde el celular |
| [docs/talleres-y-alumnos.md](docs/talleres-y-alumnos.md) | Cohortes, inscripción, grupos |
| [docs/ingreso-alumnos.md](docs/ingreso-alumnos.md) | Código + PIN, carnet, regenerar código |
| [docs/portada.md](docs/portada.md) | La landing pública y las fuentes de sus datos |
| [docs/despliegue.md](docs/despliegue.md) | Publicar a producción, secrets, dominio |
| [docs/solucion-de-problemas.md](docs/solucion-de-problemas.md) | Los errores que ya nos pasaron y cómo se arreglan |

Plan, contrato de API y decisiones de producto: [`../planning/`](../planning/) — empezar por
su `README.md`. Convenciones de código: [`../CLAUDE.md`](../CLAUDE.md).
