import { Button } from "@electrolitos/ui/components/button";
import { Link, createFileRoute } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Electrolitos</h1>
        <p className="mt-2 text-muted-foreground">
          Taller de electrónica de la academia Amautas: misiones, XP y medallas.
        </p>
      </div>

      {session ? (
        <Link to="/dashboard">
          <Button size="lg">Ir a mi panel</Button>
        </Link>
      ) : (
        <Link to="/login">
          <Button size="lg">Iniciar sesión</Button>
        </Link>
      )}
    </div>
  );
}
