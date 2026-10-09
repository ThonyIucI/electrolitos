import { MailOpen } from "lucide-react";

import { MISSION_TEASER } from "../constants/landing-content";

/**
 * El arranque de la sesión, en la portada. Es lo único del taller que un chico de 10 años
 * repite en casa, y el chico es medio comprador: la decisión se toma entre él y su apoderado.
 */
export default function MissionTeaser() {
  return (
    <figure className="rounded-2xl border-l-4 border-l-spark bg-card p-4 shadow-sticker">
      <figcaption className="flex items-center gap-2 font-heading text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
        <MailOpen className="size-3.5 shrink-0" aria-hidden="true" />
        {MISSION_TEASER.label}
      </figcaption>

      <blockquote className="mt-2 font-heading text-landing-title font-bold text-foreground italic">
        «{MISSION_TEASER.quote}»
      </blockquote>

      <p className="mt-2 text-landing-body text-muted-foreground">{MISSION_TEASER.detail}</p>
    </figure>
  );
}
