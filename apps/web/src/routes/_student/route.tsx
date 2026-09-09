import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { EUserRole, parseUserRole } from "@electrolitos/shared/roles";

import { authClient } from "@/lib/auth-client";

/** Layout para ALUMNO. Sin sesión → /login. Staff logueado → /dashboard. */
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

    return { user: { ...session.data.user, role } };
  },
});

function StudentLayout() {
  return <Outlet />;
}
