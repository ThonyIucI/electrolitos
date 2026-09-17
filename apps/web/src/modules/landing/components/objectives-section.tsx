import { Check } from "lucide-react";

import { COURSE_OBJECTIVES } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function ObjectivesSection() {
  return (
    <LandingSection
      id="objetivos"
      eyebrow="Objetivos del curso"
      title="Al finalizar, los participantes serán capaces de:"
      accent="success"
    >
      <ul className="space-y-3">
        {COURSE_OBJECTIVES.map((objective, index) => (
          <Reveal key={objective.slice(0, 32)} delay={index * 60}>
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-landing-body text-muted-foreground">{objective}</span>
            </li>
          </Reveal>
        ))}
      </ul>
    </LandingSection>
  );
}
