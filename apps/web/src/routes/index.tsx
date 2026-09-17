import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import ContactSection from "@/modules/landing/components/contact-section";
import HeroSection from "@/modules/landing/components/hero-section";
import LandingPanel from "@/modules/landing/components/landing-panel";
import LandingTabNav from "@/modules/landing/components/landing-tab-nav";
import { DEFAULT_LANDING_TAB, type TLandingTab } from "@/modules/landing/constants/landing-tabs";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/** Alto del encabezado (h-16) más su borde de 2 px. */
const HEADER_OFFSET = 66;

/**
 * Portada pública del taller. El contenido del documento informativo
 * (`docs/informativo-v2.md`) va repartido en pestañas: se lee de a un bloque,
 * sin un scroll largo. Escala tipográfica propia (`text-landing-*`).
 */
function HomePage() {
  const [activeTab, setActiveTab] = useState<TLandingTab>(DEFAULT_LANDING_TAB);
  const navAnchorRef = useRef<HTMLDivElement | null>(null);

  /** Al cambiar de pestaña la navegación queda pegada arriba y el bloque empieza ahí mismo. */
  const handleSelect = (tab: TLandingTab) => {
    setActiveTab(tab);

    const anchorTop = navAnchorRef.current?.offsetTop ?? 0;
    window.scrollTo({ top: Math.max(anchorTop - HEADER_OFFSET, 0), behavior: "smooth" });
  };

  return (
    /*
      `min-w-0` corta en seco cualquier ancho intrínseco que quiera estirar la página: es un
      ítem de grid, y sin esto el contenido ancho (la cinta de pastillas) manda sobre la
      pantalla. El recorte va con `clip` y no con `hidden` a propósito: `overflow-x: hidden`
      volvería `overflow-y` un contenedor de scroll y rompería el sticky de las pestañas.
    */
    <main className="w-full min-w-0 overflow-x-clip text-landing-body">
      <HeroSection onOpenSyllabus={() => handleSelect("temario")} />

      <div ref={navAnchorRef}>
        <LandingTabNav activeTab={activeTab} onSelect={handleSelect} />
      </div>

      <LandingPanel tab={activeTab} />

      <ContactSection />
    </main>
  );
}
