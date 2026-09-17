import { ShieldCheck } from "lucide-react";

import {
  AUDIENCE_POINTS,
  MATERIALS_NOTE,
  PARTICIPANT_REQUIREMENTS,
  SAFETY_NOTE,
} from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function AudienceSection() {
  return (
    <LandingSection id="dirigido-a" eyebrow="Dirigido a" title="Quién puede participar" accent="info">
      <ul className="space-y-3">
        {AUDIENCE_POINTS.map((point, index) => (
          <Reveal key={point.slice(0, 32)} delay={index * 60}>
            <li className="flex gap-3 text-landing-body text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-info" aria-hidden="true" />
              {point}
            </li>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={240}>
        <div className="mt-6 flex gap-3 rounded-2xl bg-success/10 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="text-landing-title font-heading font-bold text-foreground">
              Una nota para los apoderados
            </p>
            <p className="mt-1 text-landing-body text-muted-foreground">{SAFETY_NOTE}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={300}>
        <h3 className="mt-10 text-landing-title font-heading font-bold text-foreground">
          Requisitos del participante
        </h3>
      </Reveal>

      <ul className="mt-4 space-y-3">
        {PARTICIPANT_REQUIREMENTS.map((requirement, index) => (
          <Reveal key={requirement.slice(0, 32)} delay={index * 60}>
            <li className="flex gap-3 text-landing-body text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
              {requirement}
            </li>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={260}>
        <p className="mt-4 rounded-2xl bg-muted p-4 text-landing-body font-bold text-foreground">
          {MATERIALS_NOTE}
        </p>
      </Reveal>
    </LandingSection>
  );
}
