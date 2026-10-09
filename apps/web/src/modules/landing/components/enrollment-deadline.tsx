import { cn } from "@electrolitos/ui/lib/utils";
import { CalendarClock } from "lucide-react";

import { deadlineLabel, openCampuses } from "../utils/enrollment-deadline";

interface IEnrollmentDeadlineProps {
  className?: string;
}

/**
 * Plazo real de inscripción por sede. Se calcula contra la fecha de hoy, así que cuando
 * las dos sedes vencen el aviso desaparece solo en vez de quedarse mintiendo.
 */
export default function EnrollmentDeadline({ className }: IEnrollmentDeadlineProps) {
  const open = openCampuses();

  if (open.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3",
        className,
      )}
    >
      <span className="flex items-center gap-1.5 font-heading text-xs font-bold tracking-[0.12em] text-destructive uppercase">
        <CalendarClock className="size-3.5" aria-hidden="true" />
        Cierre de inscripciones
      </span>

      <ul className="flex flex-wrap items-center justify-center gap-2">
        {open.map(({ campus, daysLeft }) => (
          <li
            key={campus.key}
            className="rounded-full bg-card px-2.5 py-1 text-landing-body text-muted-foreground"
          >
            <span className="font-heading font-bold text-foreground">{campus.name}</span>:{" "}
            {deadlineLabel(daysLeft)}
          </li>
        ))}
      </ul>
    </div>
  );
}
