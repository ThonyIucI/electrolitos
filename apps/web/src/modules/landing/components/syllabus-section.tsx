import { COURSE_HOURS, FREE_HOURS, SYLLABUS_UNITS } from "../constants/landing-syllabus";
import { formatHours } from "../utils/format-hours";
import LandingSection from "./landing-section";
import Reveal from "./reveal";
import SyllabusUnit from "./syllabus-unit";

const FREE_SESSIONS_COUNT = 2;
const COURSE_SESSIONS_COUNT = 8;

export default function SyllabusSection() {
  const totalSessions = FREE_SESSIONS_COUNT + COURSE_SESSIONS_COUNT;

  return (
    <LandingSection id="contenido" eyebrow="Contenido" title="El temario, sesión por sesión" accent="spark">
      <Reveal>
        <div className="rounded-2xl bg-spark/12 p-3">
          <p className="text-landing-body text-foreground">
            Las{" "}
            <strong className="font-heading">
              {FREE_SESSIONS_COUNT} primeras sesiones son de cortesía, gratuitas y sin compromiso
            </strong>
            : recién después de ellas empiezan a contar las {COURSE_SESSIONS_COUNT} semanas del
            curso. En total, {totalSessions} sesiones — {formatHours(COURSE_HOURS)} de curso más{" "}
            {formatHours(FREE_HOURS)} de cortesía.
          </p>
        </div>
      </Reveal>

      <div className="mt-3 space-y-3">
        {SYLLABUS_UNITS.map((unit, index) => (
          <SyllabusUnit key={unit.key} unit={unit} delay={index * 60} />
        ))}
      </div>
    </LandingSection>
  );
}
