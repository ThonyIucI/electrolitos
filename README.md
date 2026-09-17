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

---

## Local y producción son dos mundos separados

No comparten absolutamente nada. Ni servidor, ni base de datos, ni usuarios.

| | Local | Producción |
|---|---|---|
| API | `wrangler dev` en tu PC, `http://localhost:3001` | Worker en Cloudflare, `https://electrolitos-api.gaiamundo.com` |
| Front | Vite en tu PC, `http://localhost:3000` | Cloudflare Pages |
| Base de datos | Archivo SQLite en `apps/server/.wrangler/state/` | D1 real en Cloudflare |
| Secrets | `apps/server/.dev.vars` | `wrangler secret put` |
| Usuarios | Los que crees en local | Los que crees en producción |

El admin que creas en local **no existe** en producción, y al revés. Trabajar en local
nunca toca los datos reales, y `pnpm dev` jamás se conecta a Cloudflare.

> **Ojo con el `database_id`.** En producción identifica la base real. En local, miniflare
> lo usa como nombre del archivo SQLite: si el ID cambia, apunta a una base **nueva y vacía**
> y hay que volver a correr `pnpm db:migrate:local` y a crear el admin.

---

## Desarrollo local

```bash
nvm use 24
pnpm install
pnpm db:migrate:local      # crea/actualiza las tablas de la base local. Idempotente
pnpm dev                   # front http://localhost:3000 · API http://localhost:3001
```

`pnpm dev` levanta **los dos** servidores en paralelo. Ctrl+C en esa terminal los mata a
ambos. Si algún día un proceso queda huérfano y el puerto aparece ocupado:

```bash
pkill -f "wrangler dev"
```

Para levantarlos por separado: `pnpm dev:web` y `pnpm dev:server`.

### Crear el admin local

Los secrets locales están en `apps/server/.dev.vars` (copiar de `.dev.vars.example` si no
existe). Después de migrar, crea tu usuario:

```bash
curl -X POST localhost:3001/api/v1/internal/seed-admin \
  -H "x-seed-token: seed-local-dev-token" -H "content-type: application/json" \
  -d '{"email":"admin@electrolitos.local","password":"admin12345","name":"Thony"}'
```

Luego entra en http://localhost:3000/login con ese correo y contraseña.

### Probar desde el celular (misma red Wi-Fi)

1. Levanta todo con `pnpm dev`. Vite imprime una línea `Network: http://192.168.x.x:3000`.
   Si no la ves, tu IP sale con `hostname -I`.
2. En el celular abre `http://<esa-ip>:3000`. Nada más: el front llama a la API por el mismo
   origen (`/api`) y Vite la reenvía al Worker local, así no hay CORS ni líos de cookies.
3. Si no carga, es el firewall del PC: `sudo ufw allow 3000/tcp`.

Cómo funciona por dentro: `apps/web/.env` tiene `VITE_SERVER_URL=/` (mismo origen) y
`apps/web/vite.config.ts` hace proxy de `/api` → `localhost:3001`. En producción la variable
apunta a la URL del Worker y no hay proxy. Las cookies son `Lax` en HTTP local y
`None; Secure` en HTTPS de producción (se decide por el esquema de `BETTER_AUTH_URL`).

---

### Crear el taller y registrar alumnos

La primera vez que entres a **Alumnos** no habrá ningún taller: la pantalla te ofrece crearlo
con los datos ya rellenados. Al crearlo aparecen también las cuatro casas de la chakana
(Paulet, Antúnez, Villarreal y Reiche). Desde ahí puedes inscribir chicos.

Para registrar rápido en clase basta **nombre y apellido**; la casa, el apoderado y la fecha
de nacimiento son opcionales y se completan después. Cada inscripción genera su código de
acceso de 6 caracteres (se usa en la Etapa 3, cuando los alumnos entren con su código).

---

## Migraciones

1. Editar el schema en `packages/db/src/schema/*.ts`
2. `pnpm db:generate` → crea el SQL en `packages/db/src/migrations/` (**nunca** escribirlo a mano)
3. `pnpm db:migrate:local` en desarrollo · `pnpm db:migrate:remote` en producción

> Cada vez que traigas cambios con tablas nuevas hay que correr **las dos**: la local para
> desarrollar y la remota antes de desplegar, o la API en producción fallará al consultarlas.

## Tests

```bash
pnpm --filter server test       # vitest dentro de workerd con D1 en memoria
pnpm check-types
```

## Deploy

Dominio propio: API en `electrolitos-api.gaiamundo.com`, web en `electrolitos.gaiamundo.com`
(subdominios nuevos sobre el dominio ya comprado, no tocan nada existente de GaIA). Pasos
completos: `../planning/CLOUDFLARE_SETUP.md`.

```bash
# API (Worker + config + vars)
pnpm deploy:server

# Front (build + subida a Cloudflare Pages)
pnpm deploy:web
```

Ambos comandos publican en producción desde tu terminal, usando la sesión de
`wrangler login`. No hacen falta API tokens ni el formulario de Workers Builds.

Secrets de producción (solo la primera vez o al rotarlos):

```bash
pnpm --filter server exec wrangler secret put BETTER_AUTH_SECRET
pnpm --filter server exec wrangler secret put SEED_TOKEN
pnpm db:migrate:remote
```

> Los scripts se llaman `deploy:worker` y `deploy:pages` dentro de cada app porque `deploy`
> es un comando propio de pnpm y secuestraría el script.

## Portada pública

La ruta `/` es la portada informativa del taller (la que ve un apoderado antes de inscribir).
Vive en `apps/web/src/modules/landing/`; los textos, el temario y las sedes son constantes en
`modules/landing/constants/`, no hay fetch. Fuente del contenido: `../docs/informativo-v2.md`
— **si cambian precios, fechas o temario, se edita ahí y luego en esas constantes.**

No se lee de corrido: el contenido va en **pestañas** (`constants/landing-tabs.ts` define la
lista y `components/landing-panel.tsx` mapea cada una a su sección). Solo se monta la pestaña
activa, y al cambiarla la barra queda pegada bajo el encabezado.

Detalles que conviene no romper:

- Escala tipográfica propia (`text-landing-body` 14 px · `text-landing-title` 16 px ·
  `text-landing-display` 20 px), definida en `packages/ui/src/styles/globals.css`. **Solo
  aplica a la portada**; el resto de la app mantiene body 18 px.
- La portada **no usa el `Header` global** (está en `CHROMELESS_ROUTES`): trae el suyo,
  `LandingHeader`, de dos filas — marca/tema/ingresar arriba y las pestañas abajo — pegado
  al tope. Al bajar se desplaza `-translate-y-14` y queda solo la fila de pestañas; al subir
  vuelve entero. **Se desplaza, no se encoge**: cambiarle el alto acortaría el documento y el
  contenido saltaría a media lectura. El estado lo da `common/hooks/use-scroll-direction.ts`,
  un único listener compartido con `useSyncExternalStore` para que nada se desfase.
- El borde inferior lo pone la fila de pestañas, no el encabezado, para que su `offsetHeight`
  sea exactamente el alto que queda fijo arriba: es lo que `routes/index.tsx` resta al
  reposicionar la página cuando cambias de pestaña. Si lo mueves, el primer párrafo se tapa.
- Las transiciones de entrada al scrollear son CSS + `IntersectionObserver`
  (`modules/landing/hooks/use-reveal.ts`), sin librería de animación, y se desactivan solas
  con `prefers-reduced-motion`. Lo mismo el carrusel y la cinta de pastillas.
- La cinta de pastillas duplica la lista y se desplaza exactamente un 50 %: **no le pongas
  `gap` al `<ul>` exterior** o el reinicio salta. Su `w-max` propaga ancho intrínseco hacia
  arriba, así que la cadena `main → section → Reveal → cinta` lleva `w-full min-w-0` y `main`
  recorta con `overflow-x-clip` — **con `overflow-x-hidden` se rompe el sticky de las
  pestañas**, porque fuerza a `overflow-y` a ser un contenedor de scroll.
- Imágenes del carrusel en `public/carrusel/*.webp`. Los originales están en
  `../docs/images/carrousel`; se reescalaron a 1200 px de ancho (1.8 MB → 164 KB). Si
  agregas una, pásala por el mismo tratamiento antes de copiarla.
- El `Header` oculta la navegación de staff cuando no hay sesión: un visitante solo ve el
  logo, el selector de tema y el botón **Ingresar**.
- El tema arranca en `system` y el botón del encabezado alterna claro/oscuro de un toque.

## Convenciones

Ver `../CLAUDE.md`. Resumen: rutas → handler → query Drizzle, sin capas extra; zod en entrada;
sobre `{ success, data, error }` en salida; `xp_events` append-only; mensajes de error en
español sin IDs; un componente por archivo; sin barrels.
