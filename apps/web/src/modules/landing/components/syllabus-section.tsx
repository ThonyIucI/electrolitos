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
        <div className="rounded-2xl bg-spark/12 p-4">
          <p className="text-landing-body text-foreground">
            El taller inicia con{" "}
            <strong className="font-heading">
              {FREE_SESSIONS_COUNT} sesiones de cortesía, totalmente gratuitas y sin compromiso
            </strong>
            , para que el participante y su familia conozcan la metodología antes de decidir. Recién
            después de ellas comienzan a contar las {COURSE_SESSIONS_COUNT} semanas del curso.
          </p>
          <p className="mt-2 text-landing-body text-muted-foreground">
            En total: {totalSessions} sesiones — {COURSE_SESSIONS_COUNT} del curso (
            {formatHours(COURSE_HOURS)}) más {FREE_SESSIONS_COUNT} de cortesía (
            {formatHours(FREE_HOURS)}).
          </p>
        </div>
      </Reveal>

      <div className="mt-4 space-y-4">
        {SYLLABUS_UNITS.map((unit, index) => (
          <SyllabusUnit key={unit.key} unit={unit} delay={index * 60} />
        ))}
      </div>
    </LandingSection>
  );
}
