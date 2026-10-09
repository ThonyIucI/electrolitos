import { LEADING_COUNTRIES, MOTIVATION_INTRO, MOTIVATION_POINTS } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

/**
 * Abre con lo que hacen los países que lideran la educación y deja el dato de PISA para el
 * final: la misma información, pero el orden cambia la emoción. «Esto hacen los primeros»
 * moviliza a un apoderado; «el Perú está en el puesto 64» solo le dice que su país es malo.
 */
export default function MotivationSection() {
  return (
    <LandingSection
      id="motivacion"
      eyebrow="Motivación"
      title="Por qué existe este taller"
      accent="destructive"
      description={MOTIVATION_INTRO}
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {LEADING_COUNTRIES.map((item, index) => (
          <Reveal key={item.country} delay={index * 70} className="h-full">
            <li className="h-full rounded-2xl border-l-4 border-l-info bg-card p-4 shadow-sticker">
              <h3 className="text-landing-title font-heading font-bold text-foreground">
                {item.country}
              </h3>
              <p className="mt-1 text-landing-body text-muted-foreground">{item.fact}</p>
            </li>
          </Reveal>
        ))}
      </ul>

      <ul className="mt-4 space-y-3">
        {MOTIVATION_POINTS.map((point, index) => (
          <Reveal key={point.slice(0, 32)} delay={index * 70}>
            <li className="rounded-2xl border-l-4 border-l-destructive bg-card p-4 text-landing-body text-muted-foreground shadow-sticker">
              {point}
            </li>
          </Reveal>
        ))}
      </ul>
    </LandingSection>
  );
}
