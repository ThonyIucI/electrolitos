import { MOTIVATION_POINTS } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function MotivationSection() {
  return (
    <LandingSection id="motivacion" eyebrow="Motivación" title="Por qué existe este taller" accent="destructive">
      <ul className="space-y-3">
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
