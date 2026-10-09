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

## Ingreso de los alumnos: código + PIN

El chico entra en `/login`, pestaña **Soy alumno**, con dos datos:

| | Qué es | Dónde vive |
|---|---|---|
| **Código** | 6 caracteres de la tarjeta. Lo **identifica**, no es secreto | `enrollments.access_code` |
| **PIN** | 4 dígitos que solo él sabe. Es el **secreto** | Contraseña de better-auth |

**La primera vez deja el PIN vacío**: hasta que elija uno, la contraseña es el propio código,
y al entrar la app lo manda a `/pin` y no le muestra nada más hasta que lo cree. Desde ese
momento el código deja de servir como contraseña.

> **Por qué no basta el código solo.** Si el código fuera también la contraseña, saber el
> usuario sería saber la contraseña: cualquiera que vea la tarjeta entra, y en un salón las
> tarjetas se prestan y se fotografían. El código identifica, el PIN autentica.

Detalles que conviene no romper:

- `students.pin_set_at` null = todavía entra con el código. Es lo que mira `GET /me`
  (`mustSetPin`) y lo que fuerza el desvío a `/pin` en `routes/_student/route.tsx`.
- `POST /me/pin` **exige la credencial actual** (el código la primera vez). Es lo que evita
  que alguien que agarre el celular desbloqueado le cambie el PIN y lo deje fuera.
- `/me` devuelve `username: null` para alumnos **a propósito**: su `displayUsername` es el
  código, o sea su contraseña inicial. El objeto de sesión de better-auth sí lo trae, así
  que esto reduce la exposición pero no la elimina.
- `emailAndPassword.minPasswordLength` está en 4 porque la contraseña del alumno es el PIN.
  Es un mínimo global de better-auth: **el staff sigue obligado a 8** por los esquemas zod
  de `internal.ts` y del formulario, no lo bajes ahí.
- El alumno no tiene correo: se le arma uno sintético `<codigo>@alumno.electrolitos.local`
  solo para cumplir la restricción `NOT NULL UNIQUE` de la tabla. Nunca se le manda nada.
- `generateAccessCodes` comprueba los códigos libres contra `enrollments` **y** contra
  `user.username`: al borrar una inscripción el código queda libre pero el usuario no, y
  reutilizarlo chocaría contra ese correo sintético.
- `overwriteUserPassword` (en `lib/student-user.ts`) usa `auth.$context`, que es **API
  interna de better-auth**. Si una actualización rompe el restablecimiento de PIN, el
  cambio está ahí y en ningún otro sitio.

### Cuando un chico olvida su PIN

Es lo normal a esa edad y no depende de ningún correo: el staff llama a

```
POST /api/v1/enrollments/:enrollmentId/reset-pin
```

y el alumno vuelve a entrar con el código de su tarjeta y a elegir un PIN nuevo.

> Todavía **no hay botón** para esto en el panel de alumnos: la ruta existe y está probada,
> pero hay que cablearla a la ficha del alumno.

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

### Datos con fuente externa

Tres bloques citan datos que no salen del documento informativo. Si alguien los cuestiona,
las fuentes son estas — y **hay que revisarlas antes de cada campaña**, porque cambian:

| Dónde | Dato | Fuente |
|---|---|---|
| `PRICE_REFERENCE` | Taller PUCP, S/ 630 · 12 h · 12–14 años | [ficha de Fabricum](https://fabricum.pucp.edu.pe/capacitate/formacion-continua/taller-en-electronica-digital-para-escolares-12-14-anos/) |
| `MATERIALS_REFERENCE` | Kits de S/ 70 a S/ 200 | [Naylamp Mechatronics](https://naylampmechatronics.com/130-kits-de-aprendizaje) |
| `LEADING_COUNTRIES` | Estonia 2012, Finlandia 2016, Japón 2020 | [ProgeTiger](https://www.educationestonia.org/progetiger-programming-school-kindergarten/) · [currículo finlandés](https://www.oph.fi/en/education-and-qualifications/national-core-curriculum-primary-and-lower-secondary-basic-education) · [Nikkei Asia](https://asia.nikkei.com/economy/coding-will-be-mandatory-in-japan-s-primary-schools-from-2020) |

La comparación con la PUCP **lleva siempre su `disclaimer`**: no es el mismo taller (ellos
hacen compuertas lógicas y simulación, acá se arman circuitos). Sin esa aclaración la
comparación es deshonesta y además se cae sola ante el primer apoderado que abra la ficha.

Detalles que conviene no romper:

- Los montos son números (`COURSE_PRICE_SOLES`, `PAID_SESSIONS`): el precio por sesión y por
  hora se **calculan** contra `COURSE_HOURS` del temario, no se escriben a mano. Si cambia el
  precio o el temario, la tabla comparativa y el desglose se actualizan solos.
- El aviso de cierre de inscripciones (`utils/enrollment-deadline.ts`) se calcula contra la
  fecha de hoy a partir de `enrollmentDeadline` de cada sede. Cuando las dos vencen el aviso
  **desaparece solo**; no hay que acordarse de bajarlo. Las fechas se parsean a mano y no con
  `new Date("2026-09-19")`, que se interpreta como UTC y en Perú devolvería el día anterior.
- Los enlaces de WhatsApp van con el mensaje ya escrito (`whatsappLink()`), y cada sede manda
  el suyo: tener que redactar el mensaje es donde más gente abandona.
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
