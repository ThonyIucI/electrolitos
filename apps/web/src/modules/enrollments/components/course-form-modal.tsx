import type { ICourseDetailResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { useForm } from "@tanstack/react-form";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import z from "zod";

import Modal from "@/common/components/modal";
import { todayIso } from "@/common/utils/format-date";
import type { ICreateCoursePayload } from "@/modules/enrollments/services/enrollment.service";

const DEFAULT_CAPACITY = 18;
const DEFAULT_PRICE_SOLES = 50;
const DEFAULT_WEEKS = 8;
const FORM_ID = "course-form";

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

const buildDefaults = (course?: ICourseDetailResource) => ({
  /* Vacío a propósito: con varias sedes el nombre lo pone el profe, no una plantilla. */
  name: course?.name ?? "",
  startsOn: course?.startsOn ?? todayIso(),
  endsOn: course?.endsOn ?? dayjs().add(DEFAULT_WEEKS, "week").format("YYYY-MM-DD"),
  capacity: String(course?.capacity ?? DEFAULT_CAPACITY),
  priceSoles: String(course?.priceSoles ?? DEFAULT_PRICE_SOLES),
});

interface ICourseFormModalProps {
  open: boolean;
  /** Sin taller es alta; con taller es edición y los campos vienen rellenados. */
  course?: ICourseDetailResource;
  onSubmit: (payload: ICreateCoursePayload) => Promise<unknown>;
  onClose: () => void;
}

/**
 * Alta y edición de una cohorte. A diferencia del alta de alumnos, acá no hay «seguir
 * creando»: un taller se crea cada varios meses, no quince seguidos.
 */
export default function CourseFormModal({
  open,
  course,
  onSubmit,
  onClose,
}: ICourseFormModalProps) {
  const isEdit = Boolean(course);

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
    <Modal
      open={open}
      title={isEdit ? "Editar taller" : "Nuevo taller"}
      description={
        isEdit
          ? "Los cambios no tocan a los inscritos ni a las casas."
          : "Al crearlo aparecen también las cuatro casas de la chakana."
      }
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" form={FORM_ID} disabled={!canSubmit || isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin motion-reduce:animate-none" />}
                {isEdit ? "Guardar cambios" : "Crear el taller"}
              </Button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id={FORM_ID}
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
                autoCapitalize="words"
                placeholder="Ingresa el nombre del taller"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="startsOn">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Empieza</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
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

          <form.Field name="endsOn">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Termina</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
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
                  step="0.5"
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
      </form>
    </Modal>
  );
}
