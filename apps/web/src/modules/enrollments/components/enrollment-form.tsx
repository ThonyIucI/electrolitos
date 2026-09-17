import type { IHouseResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { cn } from "@electrolitos/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { ChevronDown, Loader2, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import z from "zod";

import { houseColorClasses } from "@/common/constants/house-colors";
import type { ICreateStudentPayload } from "@/modules/enrollments/services/enrollment.service";

const PHONE_DIGITS = /^\d{6,15}$/;

const formSchema = z.object({
  firstName: z.string().trim().min(2, "Escribe el nombre"),
  lastName: z.string().trim().min(2, "Escribe el apellido"),
  nickname: z.string().trim().max(30, "Muy largo"),
  birthDate: z.string(),
  guardianName: z.string().trim().max(80, "Muy largo"),
  guardianPhone: z
    .string()
    .trim()
    .refine((value) => value === "" || PHONE_DIGITS.test(value.replace(/\D/g, "")), "Teléfono inválido"),
});

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  nickname: "",
  birthDate: "",
  guardianName: "",
  guardianPhone: "",
};

const emptyToNull = (value: string): string | null => value.trim() || null;

interface IEnrollmentFormProps {
  houses: IHouseResource[];
  onSubmit: (student: ICreateStudentPayload, houseId: string | null) => Promise<unknown>;
}

/**
 * Alta rápida: nombre y apellido bastan. El formulario no se cierra al guardar, se limpia
 * y devuelve el foco al primer campo para poder encadenar a los 18 chicos de corrido.
 */
export default function EnrollmentForm({ houses, onSubmit }: IEnrollmentFormProps) {
  const [houseId, setHouseId] = useState<string | null>(null);
  const [areDetailsOpen, setAreDetailsOpen] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: EMPTY_FORM,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      const created = await onSubmit(
        {
          firstName: value.firstName.trim(),
          lastName: value.lastName.trim(),
          nickname: emptyToNull(value.nickname),
          birthDate: emptyToNull(value.birthDate),
          guardianName: emptyToNull(value.guardianName),
          guardianPhone: emptyToNull(value.guardianPhone),
        },
        houseId,
      );

      if (created) {
        form.reset();
        firstFieldRef.current?.focus();
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="rounded-3xl border-2 border-border bg-card p-5 shadow-sticker-md"
    >
      <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-extrabold text-foreground">
        <UserPlus className="size-5 text-primary" />
        Nuevo alumno
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="firstName">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Nombre</Label>
              <Input
                id={field.name}
                ref={firstFieldRef}
                name={field.name}
                autoComplete="off"
                autoCapitalize="words"
                placeholder="Luz"
                aria-invalid={field.state.meta.errors.length > 0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm font-bold text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="lastName">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Apellido</Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="off"
                autoCapitalize="words"
                placeholder="Quispe"
                aria-invalid={field.state.meta.errors.length > 0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm font-bold text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      {houses.length > 0 && (
        <fieldset className="mt-4">
          <legend className="mb-2 font-heading text-base font-bold text-foreground">
            Casa <span className="font-sans font-medium text-muted-foreground">(opcional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {houses.map((house) => {
              const isSelected = houseId === house.id;
              const classes = houseColorClasses[house.colorKey];

              return (
                <button
                  key={house.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setHouseId(isSelected ? null : house.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-heading text-base font-bold transition-all",
                    isSelected
                      ? `${classes.solid} border-transparent shadow-sticker`
                      : "border-border bg-card text-muted-foreground hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "size-3 rounded-full",
                      isSelected ? "bg-current opacity-70" : classes.dot,
                    )}
                  />
                  {house.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <button
        type="button"
        onClick={() => setAreDetailsOpen((open) => !open)}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-heading text-base font-bold text-primary"
      >
        <ChevronDown className={cn("size-5 transition-transform", areDetailsOpen && "rotate-180")} />
        {areDetailsOpen ? "Ocultar datos extra" : "Agregar apoderado y edad"}
      </button>

      {areDetailsOpen && (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <form.Field name="nickname">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Apodo</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Cómo le dicen"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="birthDate">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Fecha de nacimiento</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="guardianName">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Apoderado</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  autoCapitalize="words"
                  placeholder="Mamá, papá o tutor"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="guardianPhone">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Teléfono</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  inputMode="tel"
                  placeholder="987654321"
                  aria-invalid={field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-sm font-bold text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>
      )}

      <form.Subscribe
        selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button type="submit" size="xl" className="mt-5" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin motion-reduce:animate-none" />
                Guardando…
              </>
            ) : (
              <>
                <UserPlus />
                Inscribir alumno
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
