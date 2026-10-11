import { GraduationCap, IdCard, LayoutDashboard } from "lucide-react";
import type { ComponentType } from "react";

import { EUserRole, type TUserRole } from "@electrolitos/shared/roles";

/**
 * Las rutas se listan como literales y no como `string` porque el `to` de TanStack Router
 * está tipado: un enlace a una ruta inexistente tiene que romper el build, no la página.
 */
export type TNavPath = "/dashboard" | "/cursos" | "/pasaporte";

export interface INavItem {
  to: TNavPath;
  label: string;
  /** Etiqueta corta para la barra inferior, donde no entra la larga. */
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
}

/* Los alumnos no tienen entrada propia: viven dentro de su cohorte, en «Talleres». */
const STAFF_NAV: readonly INavItem[] = [
  { to: "/dashboard", label: "Panel", shortLabel: "Panel", icon: LayoutDashboard },
  { to: "/cursos", label: "Talleres", shortLabel: "Talleres", icon: GraduationCap },
];

const STUDENT_NAV: readonly INavItem[] = [
  { to: "/pasaporte", label: "Mi pasaporte", shortLabel: "Pasaporte", icon: IdCard },
];

/**
 * Los enlaces que le tocan a cada rol. Un alumno **nunca** debe ver «Panel» ni «Talleres»:
 * no son suyos, y aunque el servidor los rechace, mostrarlos es ofrecerle una puerta que
 * se le va a cerrar en la cara.
 */
export const navItemsForRole = (role: TUserRole | null): readonly INavItem[] => {
  if (role === EUserRole.STUDENT) {
    return STUDENT_NAV;
  }

  return role ? STAFF_NAV : [];
};
