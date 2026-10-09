import { Wrench } from "lucide-react";

import { ENGINEER_NOTE, TEACHER } from "../constants/landing-content";
import LandingSection from "./landing-section";
import Reveal from "./reveal";

export default function TeacherSection() {
  return (
    <LandingSection id="docente" eyebrow="Docente" title="Quién dicta el taller" accent="info">
      <Reveal>
        <article className="rounded-2xl bg-card p-4 shadow-sticker sm:flex sm:gap-5">
          <img
            src={TEACHER.photo}
            alt={TEACHER.name}
            width={478}
            height={626}
            loading="lazy"
            className="mx-auto mb-4 h-40 w-32 rounded-xl object-cover object-top sm:mx-0 sm:mb-0 sm:h-44 sm:w-36 sm:shrink-0"
          />
          <div>
            <h3 className="text-landing-title font-heading font-bold text-foreground">
              {TEACHER.name}
            </h3>
            <p className="text-landing-body text-primary">{TEACHER.role}</p>
            <p className="mt-2 text-landing-body text-muted-foreground">{TEACHER.bio}</p>
          </div>
        </article>
      </Reveal>

      {/*
        Va junto a la bio a propósito: la afirmación «son las mismas herramientas» solo
        pesa porque la firma alguien que trabaja en un laboratorio de verdad.
      */}
      <Reveal delay={80}>
        <div className="mt-4 rounded-2xl border-l-4 border-l-info bg-info/8 p-4">
          <h3 className="flex items-center gap-2 text-landing-title font-heading font-bold text-foreground">
            <Wrench className="size-4 shrink-0 text-info" aria-hidden="true" />
            {ENGINEER_NOTE.title}
          </h3>
          <p className="mt-2 text-landing-body text-muted-foreground">{ENGINEER_NOTE.body}</p>
        </div>
      </Reveal>
    </LandingSection>
  );
}
