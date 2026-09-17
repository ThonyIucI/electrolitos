import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Loader2, Rocket } from "lucide-react";
import z from "zod";

import type { ICreateCoursePayload } from "@/modules/enrollments/services/enrollment.service";

const DEFAULT_CAPACITY = 18;
const DEFAULT_PRICE_SOLES = 50;
const DEFAULT_WEEKS = 8;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Los campos numéricos viajan como texto (vienen de un input) y se validan como tal. */
const formSchema = z.object({
  name: z.string().trim().min(3, "Ponle un nombre al taller"),
  startsOn: z.string().min(1, "Elige la fecha de inicio"),
  endsOn: z.string().min(1, "Elige la fecha de fin"),
  capacity: z.string().refine((value) => Number(value) >= 1, "El cupo debe ser mayor a cero"),
  priceSoles: z.string().refine((value) => Number(value) >= 0, "El precio no puede ser negativo"),
});

interface ICreateCourseCardProps {
  onCreate: (payload: ICreateCoursePayload) => Promise<unknown>;
}

/**
 * Estado inicial de la app: todavía no existe ningún taller. Viene con los datos reales
 * ya puestos para que sea un solo clic, y crea de paso las cuatro casas de la chakana.
 */
export default function CreateCourseCard({ onCreate }: ICreateCourseCardProps) {
  const today = new Date();

  const form = useForm({
    defaultValues: {
      name: "Taller de electrónica — Cohorte 1",
      startsOn: toIsoDate(today),
      endsOn: toIsoDate(new Date(today.getTime() + DEFAULT_WEEKS * MS_PER_WEEK)),
      capacity: String(DEFAULT_CAPACITY),
      priceSoles: String(DEFAULT_PRICE_SOLES),
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onCreate({
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
      className="rounded-3xl border-2 border-border bg-card p-6 shadow-sticker-md"
    >
      <h2 className="font-heading text-2xl font-extrabold text-foreground">Crea tu taller</h2>
      <p className="mt-1 text-base text-muted-foreground">
        Es lo primero. Al crearlo aparecen también las cuatro casas de la chakana: Paulet,
        Antúnez, Villarreal y Reiche.
      </p>

      <div className="mt-5 space-y-4">
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Nombre</Label>
              <Input
                id={field.name}
                name={field.name}
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
          <form.Field name="startsOn">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Empieza</Label>
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

          <form.Field name="endsOn">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Termina</Label>
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

          <form.Field name="capacity">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Cupo</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="priceSoles">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Precio (S/)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <form.Subscribe
        selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button type="submit" size="xl" className="mt-6" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin motion-reduce:animate-none" />
                Creando…
              </>
            ) : (
              <>
                <Rocket />
                Crear el taller
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
