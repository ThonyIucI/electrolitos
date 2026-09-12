import { createFileRoute } from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";
import SignInForm from "@/components/sign-in-form";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
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
        <SignInForm />
      </div>
    </div>
  );
}
