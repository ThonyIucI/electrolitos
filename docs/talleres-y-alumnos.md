# Talleres, cohortes y alumnos

Cada sede o promoción es una **cohorte** distinta, con su propio calendario, su propio cupo
y sus propios inscritos. Al crear una aparecen también sus cuatro casas de la chakana
(Paulet, Antúnez, Villarreal y Reiche).

## Dónde está cada cosa

- **`/cursos`** — la lista de cohortes. Crear una nueva, y entrar a cualquiera tocando su
  tarjeta.
- **`/cursos/:courseId`** — la cohorte: sus datos (editar nombre, fechas, cupo, precio,
  estado) y **sus alumnos**. Acá se inscribe, se corrige una ficha, se asigna casa y se
  reparten los códigos.

**Los alumnos no tienen pantalla propia.** Con varias sedes a la vez, una lista global no
dice a qué cohorte se está inscribiendo nadie, así que `/alumnos` redirige a `/cursos`.

> **Pueden convivir varias cohortes en curso.** Antes el servidor rechazaba la segunda con
> un 409; se quitó al abrir Ventarrones. Por eso el panel trabaja con `GET /courses` y no
> con «el taller activo», y **Alumnos** muestra un selector de cohorte cuando hay más de una.
> `GET /courses/active` sigue existiendo, pero devuelve solo la primera: no lo uses para
> pantallas nuevas.

Al renombrar **no se regenera el `slug`**: es un identificador estable y volver a derivarlo
del nombre solo serviría para chocar contra su índice único.

## Inscribir

Para registrar rápido en clase basta **nombre y apellido**; la casa, el apoderado y la fecha
de nacimiento son opcionales y se completan después. El formulario no se cierra al guardar:
se limpia y vuelve el foco al primer campo, para encadenar a los 18 de corrido.

Cada inscripción genera su **código de acceso** de 6 caracteres, que es con lo que el chico
entra a la plataforma — ver [ingreso-alumnos.md](ingreso-alumnos.md).

## Corregir y mover

En el menú «⋮» de cada alumno:

- **Editar datos** — corrige la ficha. Ojo: **el alumno es uno solo**. Si está inscrito en
  dos cohortes, el cambio se ve en las dos. El nombre se actualiza también en su cuenta,
  o seguiría viendo el viejo en su carnet.
- **Mover a otro taller** — se cambió de sede o de horario. **Conserva su código y su PIN**,
  así que no hay que volver a mandarle nada por WhatsApp. Lo único que pierde es la casa,
  porque las casas pertenecen a cada cohorte. El servidor rechaza el traslado si ya estaba
  inscrito en el taller de destino.
- **Generar código nuevo** — para cuando olvida su PIN. Ver
  [ingreso-alumnos.md](ingreso-alumnos.md).

## Pendiente

Clases (sesiones), grupos flexibles, coins y pagos están propuestos pero **sin construir**:
`../../planning/PROPUESTA_SESIONES_Y_GRUPOS.md`.
