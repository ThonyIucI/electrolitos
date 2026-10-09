import { Check, HandCoins, Package, Ticket } from "lucide-react";

import {
  COURSE_PRICE,
  COURSE_PRICE_SOLES,
  ENROLLMENT_NOTES,
  INSTALLMENTS_NOTE,
  MATERIALS_REFERENCE,
  PAID_SESSIONS,
  PAYMENT_STEPS,
  RESERVATION_NOTE,
  RESERVATION_PRICE,
  WHAT_IS_INCLUDED,
  WHY_AFFORDABLE,
} from "../constants/landing-content";
import { COURSE_HOURS } from "../constants/landing-syllabus";
import { formatHours } from "../utils/format-hours";
import { formatSoles } from "../utils/format-soles";
import EnrollmentDeadline from "./enrollment-deadline";
import LandingSection from "./landing-section";
import PriceComparison from "./price-comparison";
import Reveal from "./reveal";

const pricePerSession = COURSE_PRICE_SOLES / PAID_SESSIONS;
const pricePerHour = COURSE_PRICE_SOLES / COURSE_HOURS;

const cheapestKit = Math.min(...MATERIALS_REFERENCE.items.map((item) => item.priceSoles));

/**
 * El orden importa más que el texto: primero las anclas (cuánto vale esto afuera y cuánto
 * cuesta el material), después todo lo que entra, y recién entonces el precio. Un precio
 * sin ancla previa no se lee como barato, se lee como un número suelto.
 */
export default function InvestmentSection() {
  return (
    <LandingSection id="inversion" eyebrow="Inversión" title="Cuánto cuesta" accent="success">
      <PriceComparison />

      <Reveal delay={60}>
        <div className="mt-8 rounded-2xl bg-card p-4 shadow-sticker">
          <h3 className="flex items-center gap-2 text-landing-title font-heading font-bold text-foreground">
            <Package className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Los materiales cuestan más que el curso
          </h3>

          <ul className="mt-3 space-y-1.5">
            {MATERIALS_REFERENCE.items.map((item) => (
              <li
                key={item.label}
                className="flex justify-between gap-3 text-landing-body text-muted-foreground"
              >
                <span>{item.label}</span>
                <span className="shrink-0 font-heading font-bold text-foreground tabular-nums">
                  {formatSoles(item.priceSoles)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 border-t border-border pt-3 text-landing-body text-muted-foreground">
            {MATERIALS_REFERENCE.note} El kit más barato de esa lista ya cuesta{" "}
            {formatSoles(cheapestKit)}: más que el curso completo.
          </p>
        </div>
      </Reveal>

      <Reveal delay={90}>
        <h3 className="mt-8 text-landing-title font-heading font-bold text-foreground">
          Qué incluye
        </h3>
      </Reveal>

      <ul className="mt-3 space-y-2">
        {WHAT_IS_INCLUDED.map((item, index) => (
          <Reveal key={item.slice(0, 32)} delay={index * 50}>
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-landing-body text-muted-foreground">{item}</span>
            </li>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={80}>
        <div className="mt-8 rounded-2xl bg-card p-4 shadow-sticker">
          <p className="text-landing-body text-muted-foreground">
            Concluidas las dos sesiones gratuitas, quien decida continuar abona:
          </p>

          <p className="mt-3 text-landing-display font-heading font-bold text-foreground tabular-nums">
            {COURSE_PRICE}
          </p>

          {/* Desmenuzar el monto lo vuelve comparable con un gasto cotidiano. */}
          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <dt className="text-landing-body text-muted-foreground">Por sesión</dt>
              <dd className="font-heading text-landing-title font-bold text-foreground tabular-nums">
                {formatSoles(pricePerSession)}
              </dd>
            </div>
            <div>
              <dt className="text-landing-body text-muted-foreground">Por hora de clase</dt>
              <dd className="font-heading text-landing-title font-bold text-foreground tabular-nums">
                {formatSoles(pricePerHour)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-landing-body text-muted-foreground">
            Por las 8 semanas ({formatHours(COURSE_HOURS)} de clase), materiales incluidos.
          </p>
        </div>
      </Reveal>

      <Reveal delay={110}>
        <div className="mt-4 rounded-2xl border-l-4 border-l-info bg-info/8 p-4">
          <h3 className="text-landing-title font-heading font-bold text-foreground">
            {WHY_AFFORDABLE.title}
          </h3>
          <p className="mt-2 text-landing-body text-muted-foreground">{WHY_AFFORDABLE.body}</p>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-4 rounded-2xl bg-success/12 p-4">
          <p className="text-landing-title font-heading font-bold text-foreground">
            Las 2 primeras sesiones son gratuitas y sin compromiso.
          </p>
          <p className="mt-1 text-landing-body text-muted-foreground">
            Nadie paga antes de conocer el taller por dentro.
          </p>
          <p className="mt-3 flex gap-3 border-t border-success/25 pt-3 text-landing-body text-muted-foreground">
            <HandCoins className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <span>
              <strong className="font-heading text-foreground">{INSTALLMENTS_NOTE.title}</strong>{" "}
              {INSTALLMENTS_NOTE.body}
            </span>
          </p>
        </div>
      </Reveal>

      <Reveal delay={170}>
        <div className="mt-4 flex gap-3 rounded-2xl bg-spark p-4 text-spark-foreground shadow-sticker">
          <Ticket className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-landing-title font-heading font-bold">
              Separa la vacante con {RESERVATION_PRICE}
            </p>
            <p className="mt-1 text-landing-body">
              Los cupos son limitados y se atienden por orden de llegada. {RESERVATION_NOTE}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <EnrollmentDeadline className="mt-4" />
      </Reveal>

      <Reveal delay={230}>
        <ul className="mt-4 space-y-2">
          {ENROLLMENT_NOTES.map((note) => (
            <li
              key={note.slice(0, 32)}
              className="flex gap-3 text-landing-body text-muted-foreground"
            >
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground"
                aria-hidden="true"
              />
              {note}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={260}>
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
