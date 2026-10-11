# Despliegue

Dominio propio: API en `electrolitos-api.gaiamundo.com`, web en `electrolitos.gaiamundo.com`
(subdominios nuevos sobre el dominio ya comprado, no tocan nada existente de GaIA).

La configuración inicial de Cloudflare (cuenta, D1, DNS, Pages) está en
`../../planning/CLOUDFLARE_SETUP.md`. Esto de acá es lo que se corre **cada vez**.

## Cada despliegue

El orden importa: primero la base, después la API, después el front.

```bash
pnpm db:migrate:remote     # 1. solo si hubo migraciones nuevas
pnpm deploy:server         # 2. Worker
pnpm deploy:web            # 3. Pages
```

**Por qué ese orden:**

1. Si despliegas el código antes que la migración, la API consulta columnas que todavía no
   existen y devuelve «Ocurrió un error inesperado».
2. Si despliegas solo el front, la web nueva le habla a una API vieja y las pantallas que
   usan rutas nuevas responden `404 Recurso no encontrado`. **Este es el error más fácil de
   cometer**, porque el front se ve correcto y el fallo parece del navegador.

Ambos comandos publican desde tu terminal usando la sesión de `wrangler login`. No hacen
falta API tokens ni el formulario de Workers Builds.

## Verificar qué hay publicado

Antes de ponerte a depurar, comprueba qué versión está arriba. Una ruta que existe pero pide
sesión responde **401**; una que no existe responde **404**:

```bash
curl -s https://electrolitos-api.gaiamundo.com/api/v1/health      # 200 siempre
curl -s https://electrolitos-api.gaiamundo.com/api/v1/me          # 401 si está al día
curl -s https://electrolitos-api.gaiamundo.com/api/v1/courses     # 401 si está al día
```

Si `/me` da 401 pero `/courses` da 404, el Worker es viejo: falta `pnpm deploy:server`.

## Secrets de producción

Solo la primera vez, o al rotarlos:

```bash
pnpm --filter server exec wrangler secret put BETTER_AUTH_SECRET
pnpm --filter server exec wrangler secret put SEED_TOKEN
```

Nunca van en `wrangler.jsonc` ni en ningún archivo del repo. Las variables **no** secretas
(`BETTER_AUTH_URL`, `CORS_ORIGIN`) sí viven en `wrangler.jsonc`, en `vars`.

## Crear el admin de producción

Una sola vez, con el `SEED_TOKEN` real:

```bash
curl -X POST https://electrolitos-api.gaiamundo.com/api/v1/internal/seed-admin \
  -H "x-seed-token: $SEED_TOKEN" -H "content-type: application/json" \
  -d '{"email":"...","password":"...","name":"Thony"}'
```

Es idempotente: si el admin ya existe, no hace nada.

## Respaldo de la base

Antes de una migración que borre o renombre columnas:

```bash
pnpm --filter server db:backup     # deja backup.sql
```

---

> Los scripts se llaman `deploy:worker` y `deploy:pages` dentro de cada app porque `deploy`
> es un comando propio de pnpm y secuestraría el script. Desde la raíz son `deploy:server` y
> `deploy:web`.
