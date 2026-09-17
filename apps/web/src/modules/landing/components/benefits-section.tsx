import { PARTICIPANT_BENEFITS } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function BenefitsSection() {
  return (
    <LandingSection
      id="beneficios"
      eyebrow="Beneficios"
      title="Qué incluye la inscripción"
      accent="primary"
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {PARTICIPANT_BENEFITS.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 70} className="h-full">
            <li className="h-full rounded-2xl border-l-4 border-l-primary bg-card p-4 shadow-sticker">
              <h3 className="text-landing-title font-heading font-bold text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-1 text-landing-body text-muted-foreground">{benefit.detail}</p>
            </li>
          </Reveal>
        ))}
      </ul>
    </LandingSection>
  );
}
