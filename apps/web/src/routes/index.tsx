import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import ContactSection from "@/modules/landing/components/contact-section";
import HeroSection from "@/modules/landing/components/hero-section";
import LandingHeader from "@/modules/landing/components/landing-header";
import LandingPanel from "@/modules/landing/components/landing-panel";
import { DEFAULT_LANDING_TAB, type TLandingTab } from "@/modules/landing/constants/landing-tabs";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/**
 * Portada pública del taller. El contenido del documento informativo
 * (`docs/informativo-v2.md`) va repartido en pestañas: se lee de a un bloque,
 * sin un scroll largo. Escala tipográfica propia (`text-landing-*`).
 */
function HomePage() {
  const [activeTab, setActiveTab] = useState<TLandingTab>(DEFAULT_LANDING_TAB);
  const tabRowRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  /**
   * Al cambiar de pestaña, el bloque nuevo empieza justo debajo de la fila de pestañas.
   * Se mide la fila en vez de usar una constante: al bajar el encabezado se pliega y su
   * alto cambia, y una cifra fija dejaría el primer párrafo tapado.
   */
  const handleSelect = (tab: TLandingTab) => {
    setActiveTab(tab);

    const panelTop = panelRef.current?.offsetTop ?? 0;
    const tabRowHeight = tabRowRef.current?.offsetHeight ?? 0;

    window.scrollTo({ top: Math.max(panelTop - tabRowHeight, 0), behavior: "smooth" });
  };

  return (
    /*
      `min-w-0` corta en seco cualquier ancho intrínseco que quiera estirar la página: es un
      ítem de grid, y sin esto el contenido ancho (la cinta de pastillas) manda sobre la
      pantalla. El recorte va con `clip` y no con `hidden` a propósito: `overflow-x: hidden`
      volvería `overflow-y` un contenedor de scroll y rompería el sticky del encabezado.
    */
    <main className="w-full min-w-0 overflow-x-clip text-landing-body">
      <LandingHeader activeTab={activeTab} onSelect={handleSelect} tabRowRef={tabRowRef} />

      <HeroSection onOpenSyllabus={() => handleSelect("temario")} />

      <div ref={panelRef}>
        <LandingPanel tab={activeTab} />
      </div>

      <ContactSection />
    </main>
  );
}
