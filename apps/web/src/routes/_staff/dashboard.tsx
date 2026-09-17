import { Link, createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { userRoleLabels } from "@electrolitos/shared/roles";

export const Route = createFileRoute("/_staff/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Hola, {user.name} 👋</h1>
      <p className="mt-1 text-muted-foreground">Rol: {userRoleLabels[user.role]}</p>
      <Link
        to="/alumnos"
        className="mt-6 flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-sticker-md transition-transform active:translate-y-0.5"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Users className="size-7" />
        </span>
        <span className="min-w-0">
          <span className="block font-heading text-xl font-extrabold text-foreground">Alumnos</span>
          <span className="block text-base text-muted-foreground">
            Inscribe a los chicos y asígnales su casa
          </span>
        </span>
      </Link>

      <div className="mt-4 rounded-3xl border-2 border-dashed border-border p-6 text-center text-base text-muted-foreground">
        La asistencia, el XP y el tablero llegan en la próxima etapa.
      </div>
    </div>
  );
}
