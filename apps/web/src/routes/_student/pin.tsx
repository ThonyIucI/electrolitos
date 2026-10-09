import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { IdCard, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import z from "zod";

import { normalizeAccessCode } from "@electrolitos/shared/access-code";
import {
  STUDENT_PIN_LENGTH,
  STUDENT_PIN_MESSAGES,
  hasStudentPinFormat,
  isWeakStudentPin,
} from "@electrolitos/shared/student-pin";

import { useSetStudentPin } from "@/modules/student/hooks/use-set-student-pin";

export const Route = createFileRoute("/_student/pin")({
  component: SetPinPage,
});

const onlyDigits = (value: string): string => value.replace(/\D/g, "");

const pinField = z.string().superRefine((pin, context) => {
  if (!hasStudentPinFormat(pin)) {
    context.addIssue({ code: "custom", message: STUDENT_PIN_MESSAGES.format });
    return;
  }

  if (isWeakStudentPin(pin)) {
    context.addIssue({ code: "custom", message: STUDENT_PIN_MESSAGES.weak });
  }
});

/**
 * Primera pantalla del alumno: cambia el código impreso por un PIN que solo él sabe.
 * Se le pide el código otra vez a propósito — es la prueba de que la cuenta es suya y
 * evita que alguien que agarre el celular desbloqueado lo deje fuera cambiándole el PIN.
 */
function SetPinPage() {
  const navigate = useNavigate({ from: "/pin" });
  const setPin = useSetStudentPin();

  const form = useForm({
    defaultValues: { currentCredential: "", pin: "", confirmPin: "" },
    onSubmit: async ({ value }) => {
      const result = await setPin.handler({
        currentCredential: normalizeAccessCode(value.currentCredential),
        pin: value.pin,
      });

      if (result) {
        navigate({ to: "/pasaporte" });
      }
    },
    validators: {
      onSubmit: z
        .object({
          currentCredential: z.string().trim().min(1, "Escribe el código de tu tarjeta."),
          pin: pinField,
          confirmPin: z.string(),
        })
        .refine((value) => value.pin === value.confirmPin, {
          message: STUDENT_PIN_MESSAGES.mismatch,
          path: ["confirmPin"],
        }),
    },
  });

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sticker-md sm:p-8">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 font-heading text-sm font-bold text-secondary-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Solo una vez
        </p>

        <h1 className="font-heading text-2xl font-bold text-foreground">Crea tu PIN secreto</h1>
        <p className="mt-2 text-muted-foreground">
          Tu tarjeta la puede ver cualquiera. Tu PIN es tuyo: con él nadie más va a poder entrar a
          ver tu progreso. Elige {STUDENT_PIN_LENGTH} números que no se te olviden.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-6 space-y-5"
        >
          <form.Field name="currentCredential">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;

              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>El código de tu tarjeta</Label>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="AMA7K3P"
                      aria-invalid={hasError}
                      className="pl-12 font-heading text-lg tracking-[0.2em] uppercase"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">El mismo con el que acabas de entrar.</p>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm font-bold text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              );
            }}
          </form.Field>

          {(
            [
              { name: "pin", label: "Tu PIN nuevo" },
              { name: "confirmPin", label: "Escríbelo otra vez" },
            ] as const
          ).map(({ name, label }) => (
            <form.Field key={name} name={name}>
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{label}</Label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        inputMode="numeric"
                        autoComplete="new-password"
                        maxLength={STUDENT_PIN_LENGTH}
                        placeholder="••••"
                        aria-invalid={hasError}
                        className="pl-12 font-heading text-lg tracking-[0.4em]"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(onlyDigits(event.target.value))}
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
          ))}

          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" size="xl" disabled={!canSubmit || setPin.loading}>
                {setPin.loading ? (
                  <>
                    <Loader2 className="animate-spin motion-reduce:animate-none" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <KeyRound />
                    Guardar mi PIN
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Si algún día se te olvida, pídele al profesor que te lo reinicie.
        </p>
      </div>
    </div>
  );
}
