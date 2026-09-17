import { cn } from "@electrolitos/ui/lib/utils";
import { ChevronDown } from "lucide-react";

import { LANDING_ACCENTS } from "../constants/landing-accents";
import { type ISyllabusUnit, unitTotalHours } from "../constants/landing-syllabus";
import { formatHours } from "../utils/format-hours";
import Reveal from "./reveal";

interface ISyllabusUnitProps {
  unit: ISyllabusUnit;
  delay?: number;
}

/**
 * Una unidad del temario, colapsada por defecto: en la lista solo se ve el título y las
 * horas, y el detalle se abre al tocar. `<details>` nativo — sin estado ni librería, y
 * el buscador del navegador igual encuentra el texto de dentro.
 */
export default function SyllabusUnit({ unit, delay = 0 }: ISyllabusUnitProps) {
  const accentClasses = LANDING_ACCENTS[unit.accent];
  const totalHours = formatHours(unitTotalHours(unit));

  return (
    <Reveal delay={delay}>
      <details
        className={cn(
          "group overflow-hidden rounded-2xl border-l-4 bg-card shadow-sticker",
          accentClasses.edge,
        )}
      >
        <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
              {unit.label}
              {unit.isFree ? (
                <span
                  className={cn(
                    "ml-2 rounded-full px-2 py-0.5 text-[0.625rem] tracking-normal",
                    accentClasses.chip,
                  )}
                >
                  Gratis
                </span>
              ) : null}
            </p>
            <h3 className="text-landing-title font-heading font-bold text-foreground">
              {unit.title}
            </h3>
            <p className="text-landing-body text-muted-foreground">
              {unit.span}
              {totalHours ? ` · ${totalHours}` : ""} · {unit.topics.length} temas
            </p>
          </div>

          <ChevronDown
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>

        <ol className="space-y-3 px-3 pb-3">
          {unit.topics.map((topic, index) => {
            const theory = formatHours(topic.theoryHours);
            const practice = formatHours(topic.practiceHours);

            return (
              <li key={topic.title} className="border-t border-border pt-3">
                <div className="flex gap-3">
                  <span className="font-heading text-xs font-bold text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-landing-body text-foreground">{topic.title}</p>
                    <p className="mt-1.5 flex flex-wrap gap-1.5">
                      {theory ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                          Teoría {theory}
                        </span>
                      ) : null}
                      {practice ? (
                        <span
                          className={cn("rounded-full px-2 py-0.5 text-xs font-bold", accentClasses.chip)}
                        >
                          Práctica {practice}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </details>
    </Reveal>
  );
}
