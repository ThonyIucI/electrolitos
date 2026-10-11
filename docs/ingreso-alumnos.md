# Ingreso de los alumnos: código + PIN

El chico tiene dos credenciales:

| | Qué es | Dónde vive |
|---|---|---|
| **Código** | 6 caracteres. Lo **identifica**, no es secreto | `enrollments.access_code` |
| **PIN** | 4 dígitos que solo él sabe. Es el **secreto** | Contraseña de better-auth |

> **Por qué no basta el código solo.** Si el código fuera también la contraseña, saber el
> usuario sería saber la contraseña: el código viaja por WhatsApp, y un mensaje reenviado
> bastaría para entrar. El código identifica, el PIN autentica.

## El flujo

El ingreso **le pregunta al back qué sigue** en vez de hacerlo adivinar. Con el código en
la mano, `GET /access/status?codigo=` responde una de dos cosas:

| Respuesta | Qué pasa |
|---|---|
| `needs-setup` | Todavía no tiene PIN. Entra con el propio código y se le abre la ventana para crearlo |
| `needs-pin` | **Todo lo demás.** Aparece el teclado del PIN |

`needs-pin` es el cajón de sastre a propósito: ahí caen el que ya tiene PIN, el código que
no existe, el mal escrito y la inscripción dada de baja. Así de la respuesta no se puede
deducir qué códigos son válidos.

**Este GET escribe en un caso**: si la inscripción está activa pero `students.user_id` es
null — porque es anterior a esta función, o porque la creación falló a media inscripción —
le crea la cuenta ahí mismo y devuelve `needs-setup`. Es feo que un GET mute, y es a
propósito: la alternativa era devolverle `needs-pin` y dejar al chico escribiendo un PIN
que no existe hasta que alguien se diera cuenta. Es idempotente y no abre ninguna puerta
nueva: solo completa una cuenta que ya debería existir para una inscripción que ya existe.

Lo único que se filtra es «este código todavía no tiene PIN», que es justo el caso en el
que el código **es** la contraseña. Dar con uno al azar exige decenas de millones de
intentos sobre 32^6 combinaciones, y solo sirve en la ventana entre la inscripción y el
primer ingreso — pero **conviene una regla WAF sobre `/access/status`**, porque esa ruta
es pública y no pasa por el rate limit de better-auth.

Si ya tiene sesión abierta no ve el formulario: el `beforeLoad` de `/login` lo manda directo
a su perfil.

## El PIN

Se escribe en un **teclado propio** (`common/components/pin-keypad.tsx`), con los puntos del
progreso y botones grandes: el teclado del sistema tapa media pantalla en un celular de gama
baja. Avanza solo al cuarto dígito, como el desbloqueo de un celular.

La primera vez que entra le salta encima una ventana que no se puede cerrar — *«Para poder
continuar, crea un PIN»* — con el PIN y su confirmación. Desde que lo guarda, el código deja
de servir como contraseña, y puede cambiarlo cuando quiera desde su perfil.

**El alumno no tiene «olvidé mi PIN».** Si se le olvida, el profesor le genera un código
nuevo desde el panel. Lo único que hay en su perfil es *cambiar* el PIN, y eso exige saber
el actual.

**La sesión dura 7 días sin usarse**, no 7 días a secas: `updateAge` la renueva como mucho
una vez al día mientras el chico entre. Entra directo siempre; solo se le vuelve a pedir el
PIN si pasó una semana entera sin aparecer, o si cerró sesión a propósito.

## Cómo se le hace llegar el código

**No hay tarjetas impresas** (se descartó la idea; si ves el término en algún comentario
viejo, es eso). El código se genera solo al inscribir y se reparte por WhatsApp.

En **Alumnos**, el chip con el código de cada chico es un botón. Al tocarlo **no copia el
código suelto, sino el mensaje completo** listo para pegar en el chat
(`modules/enrollments/utils/invite-message.ts`):

```
¡Hola Luz! 👋

Tu código de ingreso a la plataforma es: *AMA7K3P* 🔑

Entra directo desde aquí 👉 https://…/login?codigo=AMA7K3P

Si tienes algún problema no dudes en contactar al profesor. 👨‍🏫
```

Los asteriscos son el marcado de negrita de WhatsApp, no decoración. Si hay apodo se saluda
con el apodo.

**El enlace es el camino normal**: el chico lo toca y entra sin escribir nada — la ruta
`/login` lee `?codigo=` y lo intenta de inmediato. El código va igual en el texto por si
abre la app por su cuenta o el enlace se rompe al reenviarse; si el parámetro falta o viene
mal, se ignora y queda el formulario de siempre.

El origen del enlace sale de `window.location.origin`, o sea de donde esté abierta la app
cuando copias: en local la IP de la red, en producción el dominio. No hay nada que
configurar, pero **si copias desde `localhost` el enlace no le va a servir al chico**.

## El carnet

En vez de la tarjeta física, el chico tiene un **carnet virtual** en `/pasaporte`
(`modules/student/components/student-card.tsx`), con su nombre, su casa, su código y desde
cuándo es parte del taller. Lo sirve `GET /me/card`.

Es el **único sitio donde el código viaja hacia un alumno**, y solo hacia el dueño de la
cuenta. Llega `null` mientras `pin_set_at` sea null: hasta entonces el código es su
contraseña y no se le muestra ni a él. En la práctica nunca llega a ver esa versión, porque
la ventana del PIN le tapa todo hasta que lo crea.

## Cuando un chico olvida su PIN

Pasa seguido a esa edad y no puede depender de un correo que no tiene. En **Alumnos**, el
menú «⋮» de su ficha tiene **Generar código nuevo** (`POST /enrollments/:id/regenerate-code`).
Pide confirmación porque el código viejo muere en el acto.

Qué hace, en orden:

1. Genera un código nuevo y lo guarda en `enrollments.access_code`.
2. Actualiza `user.username`, `display_username` y el correo sintético, que se deriva del
   código y si no se actualiza deja de cuadrar.
3. Pone la contraseña en el código nuevo y `students.pin_set_at` en null.
4. **Borra sus sesiones abiertas.** Si el motivo fue que la credencial circuló, dejar viva
   una sesión en otro celular haría inútil el cambio.

El chico vuelve a entrar con el código nuevo, le salta la ventana del PIN y sigue adelante.

> **Su contenido no se toca.** La inscripción, la casa, la asistencia y el XP cuelgan de
> `enrollment_id`, no del código: encuentra todo tal como lo dejó. Lo único que cambió son
> sus credenciales.

Después de generarlo, el chip del código ya muestra el nuevo: tócalo y se copia el mensaje
de WhatsApp listo para enviárselo.

---

## Detalles que conviene no romper

- `students.pin_set_at` null = todavía entra con el código. Es lo que mira `GET /me`
  (`mustSetPin`) y lo que abre la ventana bloqueante en `routes/_student/route.tsx`.
- `PinDialog` usa el `<dialog>` nativo, no una librería: trae atrapado de foco y fondo
  inerte gratis. En modo `create` se cancela el `Escape`, o el chico se la salta.
- Al crear el **primer** PIN no se pide nada más. Volver a pedir el código no protegería de
  nada: para tener esa sesión ya hubo que usarlo. **Cambiarlo** después sí exige el PIN
  actual, y eso sí evita que alguien con el celular desbloqueado lo deje fuera.
- Tras crear el PIN, el layout remonta el `Outlet` con una `key`: el carnet se había pedido
  con el código oculto y hay que volver a pedirlo ya con la cuenta protegida.
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
  interna de better-auth**. Si una actualización rompe la regeneración de código, el cambio
  está ahí y en ningún otro sitio.
- El rate limit de ingreso (60/min) guarda su contador en un `Map` de módulo de better-auth:
  sobrevive a que `createAuth()` se llame por request, pero es **por isolate de Workers, no
  global**. Frena el tanteo de códigos desde un sitio, no un ataque repartido; para eso haría
  falta una regla WAF en Cloudflare. El cupo es **por IP y un salón sale por la misma**, por
  eso son 60 y no 10: 18 chicos entrando a la vez, a dos intentos cada uno, se comerían un
  tope bajo. `DISABLE_RATE_LIMIT=true` lo apaga y **existe solo en `vitest.config.ts`**,
  porque los tests hacen más de 10 ingresos por archivo. Nunca la pongas en `wrangler.jsonc`.
