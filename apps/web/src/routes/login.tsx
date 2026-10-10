import { createFileRoute, redirect } from "@tanstack/react-router";

import { EUserRole, parseUserRole } from "@electrolitos/shared/roles";

import { LOGIN_CODE_PARAM } from "@/common/utils/login-link";
import { ModeToggle } from "@/components/mode-toggle";
import SignInForm from "@/components/sign-in-form";
import { authClient } from "@/lib/auth-client";

interface ILoginSearch {
  codigo?: string;
}

export const Route = createFileRoute("/login")({
  /*
    El enlace que se manda por WhatsApp trae el código. Si viene cualquier otra cosa se
    ignora en silencio y queda el formulario normal: un enlace roto no puede dejar al
    chico frente a una pantalla de error.
  */
  validateSearch: (search: Record<string, unknown>): ILoginSearch => {
    const codigo = search[LOGIN_CODE_PARAM];

    return typeof codigo === "string" && codigo.length > 0 ? { codigo } : {};
  },

  /*
    Quien ya tiene sesión no ve el formulario: el enlace de WhatsApp se abre muchas veces
    y la sesión dura una semana, así que lo normal es que ya esté dentro.
  */
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      return;
    }

    const role = parseUserRole(session.data.user.role);
    throw redirect({ to: role === EUserRole.STUDENT ? "/pasaporte" : "/dashboard" });
  },

  component: LoginPage,
});

function LoginPage() {
  const { codigo } = Route.useSearch();

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambiente de laboratorio: dos resplandores (voltio y chispa) y una malla de circuito. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-32 size-80 rounded-full bg-spark/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-size-[36px_36px] opacity-[0.06] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      <div className="relative z-10 flex w-full justify-center">
        <SignInForm initialCode={codigo} />
      </div>
    </div>
  );
}
