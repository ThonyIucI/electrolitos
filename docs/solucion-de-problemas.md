# Solución de problemas

Los errores que ya nos pasaron, con su causa real. Si te topas con uno nuevo, agrégalo acá.

## `404 Recurso no encontrado` en producción

El front llama a una ruta que **el Worker publicado no tiene**. Casi siempre es que se
desplegó el front y no la API.

Para confirmarlo, sin credenciales: una ruta que existe pero pide sesión responde **401**;
una que no existe responde **404**.

```bash
curl -s https://electrolitos-api.gaiamundo.com/api/v1/me        # 401 → la API responde bien
curl -s https://electrolitos-api.gaiamundo.com/api/v1/courses   # 404 → el Worker es viejo
```

Arreglo:

```bash
pnpm db:migrate:remote     # si hubo migraciones nuevas
pnpm deploy:server
```

## `Ocurrió un error inesperado` al entrar

La base no tiene una columna que el código ya consulta: falta aplicar una migración.

```bash
pnpm db:migrate:local      # en desarrollo
pnpm db:migrate:remote     # en producción
```

Pasa cada vez que traes cambios con tablas nuevas. Hay que correr **las dos**: la local para
desarrollar y la remota antes de desplegar.

## `Address already in use (0.0.0.0:3009)`

Quedó un `wrangler dev` huérfano de una corrida anterior ocupando el puerto de la API.
No es un problema de configuración: los puertos son **3008 el front y 3009 la API**, y no
hay ningún 3000 en el proyecto.

```bash
pkill -f "wrangler dev"
pnpm dev
```

Si el ocupado fuera el 3008, lo mismo con `pkill -f "vite"`. Para ver quién tiene el puerto
antes de matar nada: `ss -ltnp | grep 3009`.

## La base local aparece vacía de golpe

Cambió el `database_id` de `apps/server/wrangler.jsonc`. En local, miniflare lo usa como
nombre del archivo SQLite, así que un ID distinto es una base nueva. Hay que volver a correr
`pnpm db:migrate:local` y a crear el admin — ver el README.

## El enlace de WhatsApp no le funciona al alumno

Copiaste el mensaje con la app abierta en `localhost`. El enlace sale de
`window.location.origin`: ábrela en la IP de la red o en el dominio de producción y vuelve a
copiarlo.

## Un alumno con código válido ve «ingresa tu PIN» en su primer ingreso

Ya no debería pasar: `GET /access/status` detecta la inscripción sin cuenta y la crea sola.
Si vuelve a ocurrir, mira `students.user_id` de ese alumno — ver
[ingreso-alumnos.md](ingreso-alumnos.md).

## El celular no abre `http://192.168.x.x:3008`

Firewall del PC: `sudo ufw allow 3008/tcp`. Detalle en [entornos.md](entornos.md).
