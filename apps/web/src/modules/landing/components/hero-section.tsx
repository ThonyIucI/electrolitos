import { Button } from "@electrolitos/ui/components/button";
import { BookOpen, MessageCircle, Sparkles } from "lucide-react";

import { WHATSAPP_LINK } from "../constants/landing-content";
import HeroCarousel from "./hero-carousel";
import HighlightsMarquee from "./highlights-marquee";
import Reveal from "./reveal";

interface IHeroSectionProps {
  onOpenSyllabus: () => void;
}

/** Portada: qué es, para quién, y el gancho de las dos clases gratis. */
export default function HeroSection({ onOpenSyllabus }: IHeroSectionProps) {
  return (
    /* El padding lateral va por bloque, no en la sección: así la cinta de pastillas
       llega de borde a borde sin márgenes negativos. */
    <section className="relative w-full min-w-0 overflow-hidden pt-8 pb-10">
      {/* Halo de marca, muy tenue: da color sin convertir el fondo en un afiche. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-primary)_0%,transparent_70%)] opacity-[0.14]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <Reveal className="w-full">
          <HeroCarousel />
        </Reveal>

        <Reveal delay={80}>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-spark/20 px-3 py-1 font-heading text-xs font-bold text-spark-foreground dark:text-spark">
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
      </div>

      <Reveal delay={200} className="relative mt-6 w-full min-w-0">
        <HighlightsMarquee />
      </Reveal>

      <Reveal delay={260} className="relative mx-auto mt-7 max-w-3xl px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onOpenSyllabus}>
            <BookOpen aria-hidden="true" />
            Ver el contenido
          </Button>
          <Button
            render={
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                Escríbenos por WhatsApp
              </a>
            }
            size="lg"
            variant="outline"
          />
        </div>
      </Reveal>
    </section>
  );
}
