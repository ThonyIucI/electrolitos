import type { ICourseDetailResource, IEnrollmentResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import { ArrowRight } from "lucide-react";

import Modal from "@/common/components/modal";

interface IMoveStudentModalProps {
  /** Sin inscripción la modal está cerrada. */
  enrollment?: IEnrollmentResource;
  /** Todas las cohortes; la actual se descarta acá dentro. */
  courses: ICourseDetailResource[];
  onMove: (enrollmentId: string, courseId: string) => Promise<unknown>;
  onClose: () => void;
}

/**
 * Mueve a un chico de cohorte: cambió de sede o de horario. Conserva su código y su PIN,
 * así que no hay que volver a mandarle nada; lo único que pierde es su casa, porque las
 * casas son de cada taller.
 */
export default function MoveStudentModal({
  enrollment,
  courses,
  onMove,
  onClose,
}: IMoveStudentModalProps) {
  const targets = courses.filter((course) => course.id !== enrollment?.courseId);

  return (
    <Modal
      open={Boolean(enrollment)}
      width="sm"
      title="Mover a otro taller"
      description={
        enrollment
          ? `${enrollment.student.firstName} conserva su código y su PIN. Se queda sin casa, porque las casas son de cada taller.`
          : undefined
      }
      onClose={onClose}
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      }
    >
      {targets.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-border p-4 text-base text-muted-foreground">
          No hay otro taller al que moverlo. Crea el de la nueva sede primero.
        </p>
      ) : (
        <ul className="space-y-2">
          {targets.map((course) => (
            <li key={course.id}>
              <button
                type="button"
                onClick={() => {
                  if (enrollment) {
                    void onMove(enrollment.id, course.id);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-border p-4 text-left transition-colors hover:bg-accent"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-lg font-bold break-words text-foreground">
                    {course.name}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {course.enrollmentCount} de {course.capacity} inscritos
                  </span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
