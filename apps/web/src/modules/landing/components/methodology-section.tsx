import { SESSION_FLOW } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function MethodologySection() {
  return (
    <LandingSection
      id="metodologia"
      eyebrow="Metodología"
      title="Así transcurre una sesión"
      accent="spark"
      description="El taller no se enseña como una clase tradicional. Cada sesión es una misión y los participantes son agentes que deben resolverla."
    >
      <ol className="space-y-3">
        {SESSION_FLOW.map((moment, index) => (
          <Reveal key={moment.name} delay={index * 70}>
            <li className="flex gap-3 rounded-2xl bg-card p-4 shadow-sticker">
              <span
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-spark/20 font-heading text-xs font-bold text-spark-foreground dark:text-spark"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="text-landing-title font-heading font-bold text-foreground">
                    {moment.name}
                  </h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                    {moment.duration}
                  </span>
                </div>
                <p className="mt-1 text-landing-body text-muted-foreground">{moment.detail}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </LandingSection>
  );
}
