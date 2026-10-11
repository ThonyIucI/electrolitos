import type { IHouseResource, IStudentResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { cn } from "@electrolitos/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import z from "zod";

import Modal from "@/common/components/modal";
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
    .refine(
      (value) => value === "" || PHONE_DIGITS.test(value.replace(/\D/g, "")),
      "Teléfono inválido",
    ),
});

const buildDefaults = (student?: IStudentResource) => ({
  firstName: student?.firstName ?? "",
  lastName: student?.lastName ?? "",
  nickname: student?.nickname ?? "",
  birthDate: student?.birthDate ?? "",
  guardianName: student?.guardianName ?? "",
  guardianPhone: student?.guardianPhone ?? "",
});

const emptyToNull = (value: string): string | null => value.trim() || null;

/** Si ya hay datos extra cargados el panel abre solo: si no, parecería que se perdieron. */
const hasExtraData = (student?: IStudentResource): boolean =>
  Boolean(
    student?.nickname || student?.birthDate || student?.guardianName || student?.guardianPhone,
  );

const FORM_ID = "student-form";

interface IStudentFormModalProps {
  open: boolean;
  /** Sin alumno es alta; con alumno es corrección de su ficha. */
  student?: IStudentResource;
  /** Chips de casa. Solo en el alta: en la edición la casa se cambia desde la tarjeta. */
  houses?: IHouseResource[];
  onSubmit: (student: ICreateStudentPayload, houseId: string | null) => Promise<unknown>;
  onClose: () => void;
}

/**
 * Alta y edición del alumno, en la misma modal para que los campos no se desincronicen.
 *
 * En el alta **no se cierra al guardar**: se limpia y devuelve el foco al primer campo,
 * porque el caso real es registrar a quince chicos de corrido el primer día de clase.
 * Al terminar se cierra con «Cancelar» — lo ya guardado está guardado.
 */
export default function StudentFormModal({
  open,
  student,
  houses,
  onSubmit,
  onClose,
}: IStudentFormModalProps) {
  const isEdit = Boolean(student);
  const [houseId, setHouseId] = useState<string | null>(null);
  const [areDetailsOpen, setAreDetailsOpen] = useState(() => hasExtraData(student));
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: buildDefaults(student),
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      const saved = await onSubmit(
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

      if (!saved) {
        return;
      }

      if (isEdit) {
        onClose();
        return;
      }

      form.reset();
      setHouseId(null);
      firstFieldRef.current?.focus();
    },
  });

  return (
    <Modal
      open={open}
      title={isEdit ? "Editar alumno" : "Inscribir alumno"}
      description={
        isEdit
          ? "El alumno es uno solo: si está en dos talleres, el cambio se ve en los dos."
          : "Con el nombre y el apellido basta. Lo demás se completa cuando haya tiempo."
      }
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin motion-reduce:animate-none" />}
                {isEdit ? "Guardar" : "Inscribir"}
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
      >
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
                  placeholder="Ingresa el nombre"
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
                  placeholder="Ingresa el apellido"
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

        {houses && houses.length > 0 && (
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
          onClick={() => setAreDetailsOpen((isOpen) => !isOpen)}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-heading text-base font-bold text-primary"
        >
          <ChevronDown
            className={cn("size-5 transition-transform", areDetailsOpen && "rotate-180")}
          />
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
                    placeholder="Ingresa el apodo"
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
                    placeholder="Ingresa el nombre del apoderado"
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
                    placeholder="Ingresa el teléfono"
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
      </form>
    </Modal>
  );
}
