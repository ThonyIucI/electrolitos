import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { isStaffRole, parseUserRole } from "@electrolitos/shared/roles";

import { authClient } from "@/lib/auth-client";

/** Layout para ADMIN/TEACHER. Sin sesión → /login. Alumno logueado → /pasaporte. */
export const Route = createFileRoute("/_staff")({
  component: StaffLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }

    const role = parseUserRole(session.data.user.role);
    if (!isStaffRole(role)) {
      throw redirect({ to: "/pasaporte" });
    }

    return { user: { ...session.data.user, role } };
  },
});

function StaffLayout() {
  return <Outlet />;
}
