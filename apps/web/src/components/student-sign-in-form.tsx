import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { IdCard, KeyRound, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import {
  ACCESS_CODE_LENGTH,
  isValidAccessCode,
  normalizeAccessCode,
} from "@electrolitos/shared/access-code";
import { STUDENT_PIN_LENGTH, hasStudentPinFormat } from "@electrolitos/shared/student-pin";

import { authClient } from "@/lib/auth-client";

/* Se escribe pegado o con guion: "ama-7k3p" y "AMA7K3P" entran igual. */
const TYPED_CODE_MAX = ACCESS_CODE_LENGTH + 2;

const onlyDigits = (value: string): string => value.replace(/\D/g, "");

/**
 * Ingreso del alumno. El código de la tarjeta lo identifica; el PIN es su secreto.
 *
 * El PIN va vacío la primera vez: hasta que el chico elija uno, la contraseña sigue
 * siendo el propio código. Así entra con un solo dato y sin tener que entender nada,
 * y la app lo lleva de inmediato a crear su PIN.
 */
export default function StudentSignInForm() {
  const navigate = useNavigate({ from: "/" });

  const form = useForm({
    defaultValues: { code: "", pin: "" },
    onSubmit: async ({ value }) => {
      const code = normalizeAccessCode(value.code);
      const pin = value.pin.trim();

      await authClient.signIn.username(
        { username: code.toLowerCase(), password: pin || code },
        {
          onSuccess: () => {
            navigate({ to: "/pasaporte" });
            toast.success("¡Entraste!");
          },
          /* Mensaje único: nunca se revela si el código existe o si falló solo el PIN. */
          onError: () => {
            toast.error("Código o PIN incorrecto. Revisa tu tarjeta.");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        code: z
          .string()
          .transform(normalizeAccessCode)
          .refine(isValidAccessCode, "Ese código no se parece al de tu tarjeta."),
        pin: z
          .string()
          .refine(
            (pin) => pin.trim() === "" || hasStudentPinFormat(pin.trim()),
            `Tu PIN son ${STUDENT_PIN_LENGTH} números.`,
          ),
      }),
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      <form.Field name="code">
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Tu código</Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="username"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={TYPED_CODE_MAX}
                  placeholder="AMA7K3P"
                  aria-invalid={hasError}
                  className="pl-12 font-heading text-lg tracking-[0.2em] uppercase"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                />
              </div>
              <p className="text-sm text-muted-foreground">El que está en tu tarjeta.</p>
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm font-bold text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          );
        }}
      </form.Field>

      <form.Field name="pin">
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Tu PIN</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={STUDENT_PIN_LENGTH}
                  placeholder="••••"
                  aria-invalid={hasError}
                  className="pl-12 font-heading text-lg tracking-[0.4em]"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(onlyDigits(event.target.value))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                ¿Es tu primera vez? Déjalo vacío: lo creas al entrar.
              </p>
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
                Entrando…
              </>
            ) : (
              <>
                <Sparkles />
                Entrar
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
