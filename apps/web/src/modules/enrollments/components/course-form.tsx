import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { useForm } from "@tanstack/react-form";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import z from "zod";

import type { ICourseDetailResource } from "@electrolitos/shared/resources";

import { todayIso } from "@/common/utils/format-date";
import type { ICreateCoursePayload } from "@/modules/enrollments/services/enrollment.service";

const DEFAULT_CAPACITY = 18;
const DEFAULT_PRICE_SOLES = 50;
const DEFAULT_WEEKS = 8;

/** Los campos numéricos viajan como texto (vienen de un input) y se validan como tal. */
const formSchema = z
  .object({
    name: z.string().trim().min(3, "Ponle un nombre al taller"),
    startsOn: z.string().min(1, "Elige la fecha de inicio"),
    endsOn: z.string().min(1, "Elige la fecha de fin"),
    capacity: z.string().refine((value) => Number(value) >= 1, "El cupo debe ser mayor a cero"),
    priceSoles: z.string().refine((value) => Number(value) >= 0, "El precio no puede ser negativo"),
  })
  .refine((value) => value.endsOn >= value.startsOn, {
    message: "El taller no puede terminar antes de empezar",
    path: ["endsOn"],
  });

interface ICourseFormProps {
  /** Sin curso es alta; con curso es edición y los campos vienen rellenados. */
  course?: ICourseDetailResource;
  submitLabel: string;
  submitIcon: ReactNode;
  onSubmit: (payload: ICreateCoursePayload) => Promise<unknown>;
}

const buildDefaults = (course?: ICourseDetailResource) => ({
  /* Vacío a propósito: con varias sedes el nombre lo pone el profe, no una plantilla. */
  name: course?.name ?? "",
  startsOn: course?.startsOn ?? todayIso(),
  endsOn: course?.endsOn ?? dayjs().add(DEFAULT_WEEKS, "week").format("YYYY-MM-DD"),
  capacity: String(course?.capacity ?? DEFAULT_CAPACITY),
  priceSoles: String(course?.priceSoles ?? DEFAULT_PRICE_SOLES),
});

/** Campos del taller. Los comparten el alta y la edición para que no se desincronicen. */
export default function CourseForm({
  course,
  submitLabel,
  submitIcon,
  onSubmit,
}: ICourseFormProps) {
  const form = useForm({
    defaultValues: buildDefaults(course),
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name.trim(),
        startsOn: value.startsOn,
        endsOn: value.endsOn,
        capacity: Number(value.capacity),
        priceSoles: Number(value.priceSoles),
      });
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Nombre</Label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="Ingresa el nombre del taller"
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

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            { name: "startsOn", label: "Empieza", type: "date" },
            { name: "endsOn", label: "Termina", type: "date" },
            { name: "capacity", label: "Cupo", type: "number" },
            { name: "priceSoles", label: "Precio (S/)", type: "number" },
          ] as const
        ).map(({ name, label, type }) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{label}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={type}
                  inputMode={type === "number" ? "decimal" : undefined}
                  min={type === "number" ? 0 : undefined}
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
        ))}
      </div>

      <form.Subscribe
        selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button type="submit" size="xl" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin motion-reduce:animate-none" />
                Guardando…
              </>
            ) : (
              <>
                {submitIcon}
                {submitLabel}
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
