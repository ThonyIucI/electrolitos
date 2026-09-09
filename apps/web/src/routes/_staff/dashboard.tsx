import { createFileRoute } from "@tanstack/react-router";

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
      <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        Aquí verás tus cursos, sesiones y el tablero de XP en la próxima etapa.
      </div>
    </div>
  );
}
