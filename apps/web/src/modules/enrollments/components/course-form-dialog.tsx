import { Button } from "@electrolitos/ui/components/button";
import { Rocket, Save } from "lucide-react";
import { useEffect, useRef } from "react";

import type { ICourseDetailResource } from "@electrolitos/shared/resources";

import type { ICreateCoursePayload } from "@/modules/enrollments/services/enrollment.service";

import CourseForm from "./course-form";

interface ICourseFormDialogProps {
  open: boolean;
  /** Sin curso es alta; con curso es edición. */
  course?: ICourseDetailResource;
  onSubmit: (payload: ICreateCoursePayload) => Promise<unknown>;
  onClose: () => void;
}

/** Alta y edición de un taller. Mismo `<dialog>` nativo que el resto de la app. */
export default function CourseFormDialog({
  open,
  course,
  onSubmit,
  onClose,
}: ICourseFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const isEdit = Boolean(course);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="course-dialog-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border-2 border-border bg-card p-6 text-foreground shadow-sticker-md backdrop:bg-foreground/50 backdrop:backdrop-blur-sm"
    >
      <h2 id="course-dialog-title" className="font-heading text-xl font-extrabold text-foreground">
        {isEdit ? "Editar taller" : "Nuevo taller"}
      </h2>
      <p className="mt-1 mb-5 text-base text-muted-foreground">
        {isEdit
          ? "Los cambios no tocan a los inscritos ni a las casas."
          : "Al crearlo aparecen también las cuatro casas de la chakana."}
      </p>

      {/*
        La `key` reinicia el formulario al cambiar de taller: sin ella, abrir la edición de
        otra cohorte mostraría los valores de la anterior.
      */}
      <CourseForm
        key={course?.id ?? "nuevo"}
        course={course}
        submitLabel={isEdit ? "Guardar cambios" : "Crear el taller"}
        submitIcon={isEdit ? <Save /> : <Rocket />}
        onSubmit={async (payload) => {
          await onSubmit(payload);
        }}
      />

      <Button type="button" variant="ghost" className="mt-3 w-full" onClick={onClose}>
        Cancelar
      </Button>
    </dialog>
  );
}
