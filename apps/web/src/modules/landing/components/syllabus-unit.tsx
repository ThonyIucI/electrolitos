import { cn } from "@electrolitos/ui/lib/utils";

import { LANDING_ACCENTS } from "../constants/landing-accents";
import { type ISyllabusUnit, unitTotalHours } from "../constants/landing-syllabus";
import { formatHours } from "../utils/format-hours";
import Reveal from "./reveal";

interface ISyllabusUnitProps {
  unit: ISyllabusUnit;
  delay?: number;
}

/**
 * Una unidad del temario. En móvil cada tema es una tarjeta con chips de horas;
 * la tabla de cuatro columnas del documento impreso no se sostiene en 360 px.
 */
export default function SyllabusUnit({ unit, delay = 0 }: ISyllabusUnitProps) {
  const accentClasses = LANDING_ACCENTS[unit.accent];
  const totalHours = formatHours(unitTotalHours(unit));

  return (
    <Reveal delay={delay}>
      <article className={cn("rounded-2xl border-l-4 bg-card p-4 shadow-sticker", accentClasses.edge)}>
        <header>
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
          <h3 className="mt-1 text-landing-title font-heading font-bold text-foreground">
            {unit.title}
          </h3>
          <p className="text-landing-body text-muted-foreground">
            {unit.span}
            {totalHours ? ` · ${totalHours}` : ""}
          </p>
        </header>

        <ol className="mt-4 space-y-3">
          {unit.topics.map((topic, index) => {
            const theory = formatHours(topic.theoryHours);
            const practice = formatHours(topic.practiceHours);

            return (
              <li key={topic.title} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
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
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-bold",
                            accentClasses.chip,
                          )}
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
      </article>
    </Reveal>
  );
}
