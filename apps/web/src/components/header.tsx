import { Link, useRouterState } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import BrandMark from "./brand-mark";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const NAV_LINKS = [
  { to: "/dashboard", label: "Panel" },
  { to: "/alumnos", label: "Alumnos" },
] as const;

/** El login es pantalla completa y trae su propio control de tema. */
const CHROMELESS_ROUTES: readonly string[] = ["/login"];

export default function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: session } = authClient.useSession();

  if (CHROMELESS_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 border-b-2 border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Electrolitos — inicio">
            <BrandMark size="sm" />
          </Link>
          {/* La portada es pública: un visitante no debe ver la navegación del staff. */}
          {session ? (
            <nav className="flex gap-4 font-heading text-base font-bold">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="rounded-lg px-1 text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
                >
                  {label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
