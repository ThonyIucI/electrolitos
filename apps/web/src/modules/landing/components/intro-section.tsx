import { INTRO_PARAGRAPHS } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function IntroSection() {
  return (
    <LandingSection id="el-taller" eyebrow="El taller" title="De qué se trata" accent="primary">
      <div className="space-y-4">
        {INTRO_PARAGRAPHS.map((paragraph, index) => (
          <Reveal key={paragraph.slice(0, 32)} delay={index * 70}>
            <p className="text-landing-body text-muted-foreground">{paragraph}</p>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
}
