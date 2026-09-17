import { Button } from "@electrolitos/ui/components/button";
import { MessageCircle } from "lucide-react";

import BrandMark from "@/components/brand-mark";

import { WHATSAPP_LINK, WHATSAPP_NUMBER } from "../constants/landing-content";
import Reveal from "./reveal";

export default function ContactSection() {
  return (
    <section id="informes" className="px-4 pt-4 pb-12">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="rounded-3xl bg-primary/10 p-6 text-center">
            <BrandMark size="lg" className="mx-auto" />
            <h2 className="mt-4 text-landing-display text-foreground">Informes e inscripciones</h2>
            <p className="mt-2 text-landing-body text-muted-foreground">
              Escríbenos y te contamos cómo separar la vacante. Las dos primeras clases son gratis:
              puedes venir, ver la sesión y recién decidir.
            </p>

            <p className="mt-5 text-landing-display font-heading font-bold text-foreground tabular-nums">
              {WHATSAPP_NUMBER}
            </p>

            <div className="mt-5">
              <Button
                render={
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" />
                    Escribir por WhatsApp
                  </a>
                }
                size="lg"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <p className="mt-6 text-center text-landing-body text-muted-foreground">
            Electrolitos — Academia 
          </p>
        </Reveal>
      </div>
    </section>
  );
}
