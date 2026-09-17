import { cn } from "@electrolitos/ui/lib/utils";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import { CAMPUSES } from "../constants/landing-campuses";
import { LANDING_ACCENTS } from "../constants/landing-accents";
import { POSTPONEMENT_NOTE } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function CampusesSection() {
  return (
    <LandingSection
      id="cronograma"
      eyebrow="Sedes y cronograma"
      title="Dónde y cuándo"
      accent="primary"
      description="El taller se dicta de forma presencial en dos sedes, con sesiones semanales de 3 horas. Cada sede tiene su propio calendario."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPUSES.map((campus, index) => {
          const accentClasses = LANDING_ACCENTS[campus.accent];

          return (
            <Reveal key={campus.key} delay={index * 80} className="h-full">
              <article
                className={cn("h-full rounded-2xl border-l-4 bg-card p-4 shadow-sticker", accentClasses.edge)}
              >
                <h3 className="text-landing-title font-heading font-bold text-foreground">
                  {campus.name}
                </h3>

                <ul className="mt-3 space-y-2 text-landing-body text-muted-foreground">
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {campus.place}
                  </li>
                  <li className="flex gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {campus.schedule}
                  </li>
                </ul>

                <div className="mt-4 rounded-xl bg-muted p-3">
                  <p className="flex items-center gap-2 font-heading text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Sesiones de cortesía
                  </p>
                  <ul className="mt-2 space-y-1">
                    {campus.freeSessions.map((session) => (
                      <li key={session} className="flex items-baseline gap-2 text-landing-body text-foreground">
                        <span className={cn("size-1.5 shrink-0 rounded-full", accentClasses.dot)} aria-hidden="true" />
                        {session}
                      </li>
                    ))}
                  </ul>
                </div>

                <dl className="mt-3 space-y-1.5 text-landing-body">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Inicio del curso</dt>
                    <dd className="text-right font-bold text-foreground">{campus.courseStart}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Fin del curso</dt>
                    <dd className="text-right font-bold text-foreground">{campus.courseEnd}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={160}>
        <p className="mt-4 text-landing-body text-muted-foreground italic">{POSTPONEMENT_NOTE}</p>
      </Reveal>
    </LandingSection>
  );
}
