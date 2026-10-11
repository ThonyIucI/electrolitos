# Portada pública

La ruta `/` es la portada informativa del taller (la que ve un apoderado antes de inscribir).
Vive en `apps/web/src/modules/landing/`; los textos, el temario y las sedes son constantes en
`modules/landing/constants/`, no hay fetch. Fuente del contenido: `../../docs/informativo-v2.md`
— **si cambian precios, fechas o temario, se edita ahí y luego en esas constantes.**

No se lee de corrido: el contenido va en **pestañas** (`constants/landing-tabs.ts` define la
lista y `components/landing-panel.tsx` mapea cada una a su sección). Solo se monta la pestaña
activa, y al cambiarla la barra queda pegada bajo el encabezado.

## Datos con fuente externa

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

## Detalles que conviene no romper

- Los montos son números (`COURSE_PRICE_SOLES`, `PAID_SESSIONS`): el precio por sesión y por
  hora se **calculan** contra `COURSE_HOURS` del temario, no se escriben a mano. Si cambia el
  precio o el temario, la tabla comparativa y el desglose se actualizan solos.
- El aviso de cierre de inscripciones (`utils/enrollment-deadline.ts`) se calcula contra la
  fecha de hoy a partir de `enrollmentDeadline` de cada sede. Cuando las dos vencen el aviso
  **desaparece solo**; no hay que acordarse de bajarlo.
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
  `../../docs/images/carrousel`; se reescalaron a 1200 px de ancho (1.8 MB → 164 KB). Si
  agregas una, pásala por el mismo tratamiento antes de copiarla.
- El `Header` oculta la navegación de staff cuando no hay sesión: un visitante solo ve el
  logo, el selector de tema y el botón **Ingresar**.
- El tema arranca en `system` y el botón del encabezado alterna claro/oscuro de un toque.
