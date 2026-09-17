import { Ticket } from "lucide-react";

import {
  COURSE_PRICE,
  ENROLLMENT_NOTES,
  PAYMENT_STEPS,
  RESERVATION_PRICE,
} from "../constants/landing-content";
import { COURSE_HOURS } from "../constants/landing-syllabus";
import { formatHours } from "../utils/format-hours";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function InvestmentSection() {
  return (
    <LandingSection id="inversion" eyebrow="Inversión" title="Cuánto cuesta" accent="success">
      <Reveal>
        <div className="rounded-2xl bg-success/12 p-4">
          <p className="text-landing-title font-heading font-bold text-foreground">
            Las 2 primeras sesiones son gratuitas y sin compromiso.
          </p>
          <p className="mt-1 text-landing-body text-muted-foreground">
            Nadie paga antes de conocer el taller por dentro.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-sticker">
          <p className="text-landing-body text-muted-foreground">
            Concluidas esas dos sesiones, quien decida continuar abona el monto del curso:
          </p>
          <p className="mt-3 text-landing-display font-heading font-bold text-foreground tabular-nums">
            {COURSE_PRICE}
          </p>
          <p className="text-landing-body text-muted-foreground">
            por las 8 semanas ({formatHours(COURSE_HOURS)} de clase), materiales incluidos.
          </p>
          <p className="mt-3 border-t border-border pt-3 text-landing-body text-muted-foreground">
            El monto cubre las 8 sesiones, el uso de todos los materiales y componentes, y el acceso
            a la plataforma del taller durante todo el curso.
          </p>
          <p className="mt-3 text-landing-body text-muted-foreground">
            <strong className="font-heading text-foreground">No tiene que pagarse de una vez:</strong>{" "}
            el curso puede abonarse en partes, según lo que se acuerde con el docente. Que el monto
            no sea el motivo por el que un chico se quede fuera.
          </p>
        </div>
      </Reveal>

      <Reveal delay={110}>
        <div className="mt-4 flex gap-3 rounded-2xl bg-spark p-4 text-spark-foreground shadow-sticker">
          <Ticket className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-landing-title font-heading font-bold">
              Separa la vacante con {RESERVATION_PRICE}
            </p>
            <p className="mt-1 text-landing-body">
              Los cupos son limitados. Con {RESERVATION_PRICE} el lugar queda apartado y el resto se
              abona según lo coordinado con el docente.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <ul className="mt-4 space-y-2">
          {ENROLLMENT_NOTES.map((note) => (
            <li key={note.slice(0, 32)} className="flex gap-3 text-landing-body text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={200}>
        <h3 className="mt-10 text-landing-title font-heading font-bold text-foreground">
          Sistema de pago
        </h3>
      </Reveal>

      <ol className="mt-4 space-y-3">
        {PAYMENT_STEPS.map((step, index) => (
          <Reveal key={step.slice(0, 32)} delay={index * 70}>
            <li className="flex gap-3 rounded-2xl bg-card p-4 shadow-sticker">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/12 font-heading text-xs font-bold text-success"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <p className="text-landing-body text-muted-foreground">{step}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </LandingSection>
  );
}
