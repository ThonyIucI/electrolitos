# Convenciones de interfaz

Lo que hay que respetar para que la app no termine con cinco formas distintas de hacer lo
mismo. Los tokens y la escala visual están en `../../planning/DESIGN_SYSTEM.md`.

## Navegación

- **Móvil:** barra inferior de íconos (`components/bottom-nav.tsx`). Vive en `__root.tsx`,
  **no dentro del encabezado**: la portada y el login traen su propio encabezado, y
  colgándola de ahí el profe que entraba a la portada desde el celular se quedaba sin
  forma de volver al panel.
- **Escritorio:** los mismos enlaces en el encabezado, y también en el menú de usuario
  (que sí está en la portada).
- Los enlaces salen siempre de `navItemsForRole` (`common/constants/routes.ts`). Un alumno
  nunca ve las rutas del staff.
- El contenido lleva `pb-20 sm:pb-0` para no quedar debajo de la barra inferior.

## Formularios: siempre en una modal

**Un formulario no va en el cuerpo de la página.** Se abre con un botón. Si vive en la
página, empuja hacia abajo lo que importa —la lista— y en un celular queda todo amontonado.

Cada formulario es **un solo componente** que trae su `useForm` y su `Modal` juntos
(`student-form-modal.tsx`, `course-form-modal.tsx`). No se parte en «form» + «dialog»: el
pie de la modal necesita el estado del formulario para deshabilitar el botón mientras
guarda, y partirlo obliga a pasar ese estado de un lado a otro.

El botón de guardar vive en el **pie de la modal**, fuera del `<form>`, y lo conecta el
atributo nativo `form="<id>"`. Así queda fijo abajo aunque el formulario scrollee.

### Los botones del pie

| Modo | Botones |
|---|---|
| Alta encadenada (alumnos) | `Cancelar` · **`Crear y seguir creando`** |
| Alta suelta (talleres) | `Cancelar` · **`Crear el taller`** |
| Edición | `Cancelar` · **`Guardar cambios`** |

«Crear y seguir creando» **no cierra la modal**: guarda, limpia y devuelve el foco al
primer campo. Es para el primer día de clase, registrando quince chicos de corrido. Al
terminar se cierra con «Cancelar»; lo ya guardado está guardado.

Un taller se crea cada varios meses, así que ahí no tiene sentido y la modal se cierra.

## Modales

Tres componentes, y ninguna librería de diálogos:

| Componente | Para qué |
|---|---|
| `common/components/modal.tsx` | Formularios y contenido. **Hoja inferior en celular, tarjeta centrada en escritorio** |
| `common/components/confirm-modal.tsx` | Confirmar algo que no se deshace. **Nunca** `window.confirm()` |
| `modules/student/components/pin-dialog.tsx` | **Excepción:** el PIN del alumno |

Detalles que conviene no romper:

- La `Modal` se ancla al **visual viewport** (`use-visual-viewport.ts`), no al layout. Al
  abrirse el teclado en un celular el layout no se encoge, solo el área visible: sin esto
  el formulario queda detrás de las teclas y el chico escribe a ciegas.
- El cuerpo scrollea solo; encabezado y pie se quedan fijos.
- El fondo se congela (`body.style.overflow`) mientras está abierta, o la página de atrás
  scrollea bajo el dedo.
- La `ConfirmModal` va en `z-60` porque puede abrirse **encima** de una modal de formulario.
- En celular la confirmación es una hoja de acción: el botón principal pegado al cuerpo y
  el de cancelar flotando aparte, para que el pulgar no se equivoque.
- La animación usa `motion/react` y respeta `prefers-reduced-motion`: con eso activado solo
  cambia la opacidad, sin desplazamiento.
- **El PIN sigue en `<dialog>` nativo a propósito.** Esa ventana no se debe poder cerrar, y
  el `<dialog>` del navegador trae la trampa de foco y el fondo inerte de fábrica.

## Hooks compartidos

| Hook | Para qué |
|---|---|
| `use-boolean.ts` | Abrir/cerrar una modal sin un `useState` suelto |
| `use-media-query.ts` | Saber si estamos en escritorio (`min-width: 640px`, el `sm:` de Tailwind) |
| `use-visual-viewport.ts` | Área visible real; lo usa la `Modal` |
| `use-request.ts` | `loading` + `data` + toast de error de una petición |

## Otras reglas

- Un componente por archivo, sin barrels.
- Los placeholders empiezan con mayúscula y **no son ejemplos**: «Ingresa el nombre», nunca
  «Luz Quispe».
- Mensajes de error en español, sin IDs técnicos.
- Fechas siempre por `common/utils/format-date.ts` (dayjs con locale `es`). En tarjetas,
  `formatShortDate` — el mes largo parte la línea en dos.
