import { Link, createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Users } from "lucide-react";

import { userRoleLabels } from "@electrolitos/shared/roles";

export const Route = createFileRoute("/_staff/dashboard")({
  component: DashboardPage,
});

const SHORTCUTS = [
  {
    to: "/cursos",
    icon: GraduationCap,
    title: "Talleres",
    detail: "Crea cohortes, cámbiales el nombre, las fechas y el cupo",
  },
  {
    to: "/alumnos",
    icon: Users,
    title: "Alumnos",
    detail: "Inscribe a los chicos, asígnales su casa y envíales su código",
  },
] as const;

function DashboardPage() {
  const { user } = Route.useRouteContext();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Hola, {user.name} 👋</h1>
      <p className="mt-1 text-muted-foreground">Rol: {userRoleLabels[user.role]}</p>

      <div className="mt-6 space-y-4">
        {SHORTCUTS.map(({ to, icon: Icon, title, detail }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-sticker-md transition-transform active:translate-y-0.5"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Icon className="size-7" />
            </span>
            <span className="min-w-0">
              <span className="block font-heading text-xl font-extrabold text-foreground">
                {title}
              </span>
              <span className="block text-base text-muted-foreground">{detail}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border-2 border-dashed border-border p-6 text-center text-base text-muted-foreground">
        La asistencia, el XP y el tablero llegan en la próxima etapa.
      </div>
    </div>
  );
}
