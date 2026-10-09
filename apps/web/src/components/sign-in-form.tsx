import { cn } from "@electrolitos/ui/lib/utils";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { useState } from "react";

import Wordmark from "@/components/wordmark";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";
import StaffSignInForm from "./staff-sign-in-form";
import StudentSignInForm from "./student-sign-in-form";

type TSignInMode = "student" | "staff";

const MODES = [
  { key: "student", label: "Soy alumno", icon: GraduationCap },
  { key: "staff", label: "Soy profesor", icon: ShieldCheck },
] as const satisfies readonly { key: TSignInMode; label: string; icon: typeof ShieldCheck }[];

/**
 * Ingreso de la app. Arranca en «alumno» porque son los muchos: el staff son dos personas
 * que entran desde una computadora y saben dónde buscar.
 */
export default function SignInForm() {
  const { isPending } = authClient.useSession();
  const [mode, setMode] = useState<TSignInMode>("student");

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 flex justify-center">
        <Wordmark className="w-64 max-w-full" />
      </h1>

      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sticker-md sm:p-8">
        <div
          role="tablist"
          aria-label="Tipo de ingreso"
          className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
        >
          {MODES.map(({ key, label, icon: Icon }) => {
            const isActive = key === mode;

            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMode(key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full px-3 py-2 font-heading text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none",
                  isActive
                    ? "bg-card text-foreground shadow-sticker"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {mode === "student" ? <StudentSignInForm /> : <StaffSignInForm />}
      </div>
    </div>
  );
}
