# Entornos

## Local y producción son dos mundos separados

No comparten absolutamente nada. Ni servidor, ni base de datos, ni usuarios.

| | Local | Producción |
|---|---|---|
| API | `wrangler dev` en tu PC, `http://localhost:3009` | Worker en Cloudflare, `https://electrolitos-api.gaiamundo.com` |
| Front | Vite en tu PC, `http://localhost:3008` | Cloudflare Pages, `https://electrolitos.gaiamundo.com` |
| Base de datos | Archivo SQLite en `apps/server/.wrangler/state/` | D1 real en Cloudflare |
| Secrets | `apps/server/.dev.vars` | `wrangler secret put` |
| Usuarios | Los que crees en local | Los que crees en producción |

El admin que creas en local **no existe** en producción, y al revés. Trabajar en local
nunca toca los datos reales, y `pnpm dev` jamás se conecta a Cloudflare.

> **Ojo con el `database_id`** de `apps/server/wrangler.jsonc`. En producción identifica la
> base real. En local, miniflare lo usa como nombre del archivo SQLite: si el ID cambia,
> apunta a una base **nueva y vacía**, y hay que volver a correr `pnpm db:migrate:local` y a
> crear el admin.

## Probar desde el celular (misma red Wi-Fi)

1. Levanta todo con `pnpm dev`. Vite imprime una línea `Network: http://192.168.x.x:3008`.
   Si no la ves, tu IP sale con `hostname -I`.
2. En el celular abre `http://<esa-ip>:3008`. Nada más.
3. Si no carga, es el firewall del PC: `sudo ufw allow 3008/tcp`.

Por qué funciona sin configurar nada: `apps/web/.env` tiene `VITE_SERVER_URL=/` (mismo
origen) y `apps/web/vite.config.ts` hace proxy de `/api` → `localhost:3009`. Como el front y
la API salen por el mismo origen, no hay CORS ni líos de cookies.

En producción esa variable apunta a la URL del Worker y no hay proxy. Las cookies son `Lax`
en HTTP local y `None; Secure` en HTTPS de producción — se decide solo, según el esquema de
`BETTER_AUTH_URL`.

## Secrets

Nunca van en archivos del repo. Solo en dos sitios:

- **Local:** `apps/server/.dev.vars` (está en `.gitignore`).
- **Producción:** `wrangler secret put <NOMBRE>`.

Son `BETTER_AUTH_SECRET` y `SEED_TOKEN`. El segundo permite crear un admin en producción, así
que si alguna vez se filtra hay que rotarlo **antes** que nada.
