import { cn } from "@electrolitos/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import type { INavItem } from "@/common/constants/routes";

interface IBottomNavProps {
  items: readonly INavItem[];
}

/**
 * Navegación de pulgar para móvil. Solo aparece en pantallas chicas: en escritorio los
 * mismos enlaces viven en el encabezado, así que no se duplican a la vista.
 *
 * Lleva `pb-[env(safe-area-inset-bottom)]` por la barra de gestos de los celulares sin
 * botones físicos, que si no se come la fila de íconos.
 */
export default function BottomNav({ items }: IBottomNavProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map(({ to, shortLabel, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2.5 font-heading text-xs font-bold text-muted-foreground transition-colors",
                "[&.active]:text-primary",
              )}
            >
              <Icon className="size-6" />
              {shortLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
