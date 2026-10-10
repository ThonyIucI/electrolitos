import { Button } from "@electrolitos/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@electrolitos/ui/components/dropdown-menu";
import { Skeleton } from "@electrolitos/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { IdCard, LogOut } from "lucide-react";

import { EUserRole, parseUserRole, userRoleLabels } from "@electrolitos/shared/roles";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Ingresar</Button>
      </Link>
    );
  }

  const role = parseUserRole(session.user.role);
  const isStudent = role === EUserRole.STUDENT;

  return (
    <DropdownMenu>
      {/* El nombre se recorta: hay apellidos largos y el encabezado no puede crecer. */}
      <DropdownMenuTrigger render={<Button variant="outline" className="max-w-40" />}>
        <span className="truncate">{session.user.name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="min-w-0">
            <span className="block truncate font-bold text-foreground">{session.user.name}</span>
            {/*
              Al alumno no se le muestra correo: el suyo es un `@alumno.electrolitos.local`
              inventado para cumplir una restricción de la tabla, no una dirección real.
            */}
            <span className="block truncate text-sm font-normal text-muted-foreground">
              {isStudent ? userRoleLabels[role] : session.user.email}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {isStudent && (
            <DropdownMenuItem onClick={() => navigate({ to: "/pasaporte" })}>
              <IdCard className="size-4" />
              Ver mi perfil
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({ to: "/" });
                  },
                },
              });
            }}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
