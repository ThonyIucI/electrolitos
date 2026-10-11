import type { ICourseDetailResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import { CalendarDays, ChevronDown, Pencil, Wallet } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { courseStatusLabels } from "@electrolitos/shared/courses";

import { useBoolean } from "@/common/hooks/use-boolean";
import { formatShortDate } from "@/common/utils/format-date";

interface ICourseSummaryProps {
  course: ICourseDetailResource;
  /** Sale de la lista cargada y no del taller: así sube al inscribir sin recargar. */
  enrolled: number;
  onEdit: () => void;
}

/**
 * Cabecera del taller. A la vista solo lo que se mira cada clase (nombre, estado y cupo);
 * fechas y precio se consultan poco y quedan detrás de «Mostrar más».
 */
export default function CourseSummary({ course, enrolled, onEdit }: ICourseSummaryProps) {
  const details = useBoolean();
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="rounded-3xl border-2 border-border bg-card p-4 shadow-sticker">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-extrabold break-words text-foreground">
            {course.name}
          </h1>
          <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-sm font-bold text-muted-foreground">
            {courseStatusLabels[course.status]}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="Editar taller"
          title="Editar taller"
          onClick={onEdit}
        >
          <Pencil />
        </Button>
      </div>

      <p className="mt-3 text-base text-muted-foreground">
        <span className="font-heading text-lg font-extrabold text-foreground">{enrolled}</span>
        /{course.capacity} inscritos
      </p>

      <AnimatePresence initial={false}>
        {details.active && (
          <motion.dl
            className="space-y-2 overflow-hidden text-base text-muted-foreground"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 pt-2">
              <CalendarDays className="size-5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Fechas</dt>
              <dd>
                {formatShortDate(course.startsOn)} — {formatShortDate(course.endsOn)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="size-5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Precio</dt>
              <dd>S/ {course.priceSoles.toFixed(2)}</dd>
            </div>
          </motion.dl>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full text-primary"
        aria-expanded={details.active}
        onClick={details.toggle}
      >
        <ChevronDown
          className={`transition-transform motion-reduce:transition-none ${details.active ? "rotate-180" : ""}`}
        />
        {details.active ? "Mostrar menos" : "Mostrar más"}
      </Button>
    </header>
  );
}
