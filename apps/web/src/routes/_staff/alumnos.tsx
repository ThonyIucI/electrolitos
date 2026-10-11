import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Los alumnos dejaron de tener pantalla propia: se inscriben dentro de su cohorte, en
 * `/cursos/:courseId`. Con Samán, Ventarrones y lo que venga, una lista sin taller no
 * dice a cuál se está inscribiendo nadie.
 *
 * La ruta se mantiene como redirección para no romper enlaces ni marcadores viejos.
 */
export const Route = createFileRoute("/_staff/alumnos")({
  beforeLoad: () => {
    throw redirect({ to: "/cursos" });
  },
});
