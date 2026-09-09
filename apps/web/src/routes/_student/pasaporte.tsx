import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_student/pasaporte")({
  component: PassportPage,
});

function PassportPage() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">¡Hola, {user.name}!</h1>
      <p className="text-muted-foreground">
        Tu pasaporte con tu XP, nivel y medallas llegará muy pronto.
      </p>
    </div>
  );
}
