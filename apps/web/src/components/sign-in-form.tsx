import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { EUserRole } from "@electrolitos/shared/roles";

import BrandMark from "@/components/brand-mark";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

const MIN_PASSWORD_LENGTH = 8;

/** Acceso de staff (ADMIN/TEACHER) por correo. El de alumno (código) llega en la Etapa 3. */
export default function SignInForm() {
  const navigate = useNavigate({ from: "/" });
  const { isPending } = authClient.useSession();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: async () => {
            const session = await authClient.getSession();
            const isStudent = session.data?.user.role === EUserRole.STUDENT;

            navigate({ to: isStudent ? "/pasaporte" : "/dashboard" });
            toast.success("Sesión iniciada");
          },
          onError: (error) => {
            toast.error(error.error.message || "No se pudo iniciar sesión.");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Correo inválido"),
        password: z.string().min(MIN_PASSWORD_LENGTH, "La contraseña debe tener al menos 8 caracteres"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandMark size="lg" />
        <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-foreground">
          Electrolitos
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          Laboratorio de aventuras · Academia Amautas
        </p>
      </div>

      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sticker-md sm:p-8">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 font-heading text-sm font-bold text-secondary-foreground">
          <ShieldCheck className="size-4" />
          Acceso de profesores
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          <form.Field name="email">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;

              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Correo</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="profe@amautas.pe"
                      aria-invalid={hasError}
                      className="pl-12"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm font-bold text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;

              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Contraseña</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={hasError}
                      className="px-12"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                    >
                      {isPasswordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm font-bold text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" size="xl" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin motion-reduce:animate-none" />
                    Ingresando…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Iniciar sesión
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-base text-muted-foreground">
        <Sparkles className="size-5 shrink-0 text-spark" />
        ¿Eres alumno? Tu código de acceso llega muy pronto.
      </p>
    </div>
  );
}
