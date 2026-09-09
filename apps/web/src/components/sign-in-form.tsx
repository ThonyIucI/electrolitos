import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { EUserRole } from "@electrolitos/shared/roles";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

const MIN_PASSWORD_LENGTH = 8;

/** Acceso de staff (ADMIN/TEACHER) por correo. El de alumno (código) llega en la Etapa 3. */
export default function SignInForm() {
  const navigate = useNavigate({ from: "/" });
  const { isPending } = authClient.useSession();

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
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-1 text-center text-3xl font-bold">Electrolitos</h1>
      <p className="mb-6 text-center text-muted-foreground">Acceso de profesores</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Correo</Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Contraseña</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Eres alumno? El acceso con tu código llega muy pronto.
      </p>
    </div>
  );
}
