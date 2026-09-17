import { Button } from "@electrolitos/ui/components/button";
import { ArrowDown, MessageCircle, Sparkles } from "lucide-react";

import Wordmark from "@/components/wordmark";

import { HERO_HIGHLIGHTS, WHATSAPP_LINK } from "../constants/landing-content";
import Reveal from "./reveal";

/** Portada: quién dicta, qué es, para quién, y el gancho de las dos clases gratis. */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:pt-16 sm:pb-16">
      {/* Halo de marca, muy tenue: da color sin convertir el fondo en un afiche. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-primary)_0%,transparent_70%)] opacity-[0.14]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <Reveal>
          <Wordmark className="h-20 w-auto sm:h-24" />
        </Reveal>

        <Reveal delay={80}>
          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-spark/20 px-3 py-1 font-heading text-xs font-bold text-spark-foreground dark:text-spark">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Las 2 primeras clases son gratis
          </span>
        </Reveal>

        <Reveal delay={140}>
          <h1 className="mt-4 text-landing-display font-heading text-foreground">
            Taller de electrónica digital para niñas, niños y jóvenes
          </h1>
          <p className="mt-3 text-landing-body text-muted-foreground">
            Desde los 10 años, sin experiencia previa. Cada sesión es una misión: se arma, se
            programa, se prueba y se rompe hasta que funciona.
          </p>
        </Reveal>

        <Reveal delay={200} className="w-full">
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {HERO_HIGHLIGHTS.map((highlight) => (
              <li
                key={highlight}
                className="rounded-full bg-secondary px-3 py-1.5 text-landing-body font-bold text-secondary-foreground"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={260} className="w-full">
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              render={
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  Escríbenos por WhatsApp
                </a>
              }
              size="lg"
            />
            <Button
              render={
                <a href="#contenido">
                  <ArrowDown aria-hidden="true" />
                  Ver el contenido
                </a>
              }
              size="lg"
              variant="outline"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
