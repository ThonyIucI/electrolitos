import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { EUserRole, parseUserRole } from "@electrolitos/shared/roles";

import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import PinDialog from "@/modules/student/components/pin-dialog";
import { getMeRequest } from "@/modules/student/services/student.service";

/**
 * Layout para ALUMNO. Sin sesión → /login. Staff logueado → /dashboard.
 *
 * Si todavía no eligió su PIN, se le muestra la ventana de creación encima de todo apenas
 * entra: hasta ese momento su contraseña es el código que le enviaron, que cualquiera que
 * lo haya visto puede usar. La ventana no se puede cerrar.
 */
export const Route = createFileRoute("/_student")({
  component: StudentLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }

    const role = parseUserRole(session.data.user.role);
    if (role !== EUserRole.STUDENT) {
      throw redirect({ to: "/dashboard" });
    }

    /*
      Un fallo de red no puede dejar al alumno encerrado fuera de su cuenta: si no se puede
      comprobar, se le deja pasar y se vuelve a intentar en la siguiente navegación. Solo
      el 401 es concluyente y manda a /login.
    */
    let mustSetPin = false;
    try {
      mustSetPin = (await getMeRequest()).mustSetPin;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw redirect({ to: "/login" });
      }
    }

    return { user: { ...session.data.user, role }, mustSetPin };
  },
});

function StudentLayout() {
  const { mustSetPin } = Route.useRouteContext();
  /* Estado propio para cerrar la ventana al crear el PIN sin recargar la ruta. */
  const [needsPin, setNeedsPin] = useState(mustSetPin);

  return (
    <>
      {/*
        La `key` fuerza el remontaje al crear el PIN: el carnet se pidió con el código
        todavía oculto y hay que volver a pedirlo ya con la cuenta protegida.
      */}
      <Outlet key={needsPin ? "sin-pin" : "con-pin"} />
      <PinDialog open={needsPin} mode="create" onDone={() => setNeedsPin(false)} />
    </>
  );
}
