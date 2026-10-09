import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { EUserRole, parseUserRole } from "@electrolitos/shared/roles";

import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { getMeRequest } from "@/modules/student/services/student.service";

const SET_PIN_PATH = "/pin";
const PASSPORT_PATH = "/pasaporte";

/**
 * Layout para ALUMNO. Sin sesión → /login. Staff logueado → /dashboard.
 *
 * Además fuerza el paso por /pin: mientras el chico no elija su PIN sigue entrando con el
 * código impreso en la tarjeta, que cualquiera que la vea puede usar. Hasta entonces no
 * se le muestra nada más.
 */
export const Route = createFileRoute("/_student")({
  component: StudentLayout,
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }

    const role = parseUserRole(session.data.user.role);
    if (role !== EUserRole.STUDENT) {
      throw redirect({ to: "/dashboard" });
    }

    /*
      Un fallo de red no puede dejar al alumno encerrado fuera de su pasaporte: si no se
      puede comprobar, se le deja pasar y se vuelve a intentar en la siguiente navegación.
      Solo el 401 es concluyente y manda a /login.
    */
    let mustSetPin = false;
    try {
      mustSetPin = (await getMeRequest()).mustSetPin;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw redirect({ to: "/login" });
      }
    }

    const isOnSetPin = location.pathname === SET_PIN_PATH;

    if (mustSetPin && !isOnSetPin) {
      throw redirect({ to: SET_PIN_PATH });
    }

    if (!mustSetPin && isOnSetPin) {
      throw redirect({ to: PASSPORT_PATH });
    }

    return { user: { ...session.data.user, role }, mustSetPin };
  },
});

function StudentLayout() {
  return <Outlet />;
}
