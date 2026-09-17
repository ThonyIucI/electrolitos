import { cn } from "@electrolitos/ui/lib/utils";
import type { ReactNode } from "react";

import { LANDING_ACCENTS, type TLandingAccent } from "../constants/landing-accents";
import Reveal from "./reveal";

interface ILandingSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  accent?: TLandingAccent;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Cada bloque de la portada: antetítulo con punto de color, título de 20 px y contenido. */
export default function LandingSection({
  id,
  eyebrow,
  title,
  accent = "primary",
  description,
  children,
  className,
}: ILandingSectionProps) {
  const accentClasses = LANDING_ACCENTS[accent];

  return (
    <section id={id} className={cn("scroll-mt-20 px-4 py-10 sm:py-14", className)}>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="flex items-center gap-2 font-heading text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            <span className={cn("size-2 rounded-full", accentClasses.dot)} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 className="mt-2 text-landing-display text-foreground">{title}</h2>
          {description ? (
            <p className="mt-2 text-landing-body text-muted-foreground">{description}</p>
          ) : null}
        </Reveal>

        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
