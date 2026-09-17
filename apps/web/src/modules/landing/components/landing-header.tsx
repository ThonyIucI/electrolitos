import { cn } from "@electrolitos/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import type { RefObject } from "react";

import { useScrollDirection } from "@/common/hooks/use-scroll-direction";
import BrandMark from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";

import type { TLandingTab } from "../constants/landing-tabs";
import LandingTabNav from "./landing-tab-nav";

interface ILandingHeaderProps {
  activeTab: TLandingTab;
  onSelect: (tab: TLandingTab) => void;
  tabRowRef: RefObject<HTMLDivElement | null>;
}

/**
 * Encabezado propio de la portada, en dos filas y pegado al tope. Al bajar se desplaza
 * hacia arriba justo el alto de la fila de marca (`h-14`), así que esa fila sale de
 * pantalla y la de pestañas queda al ras: nunca se pierde de vista dónde estás ni a
 * dónde puedes ir. Al subir vuelve entera, con el acceso a la cuenta.
 *
 * Se desplaza en lugar de encogerse porque el encabezado está en el flujo: reducir su
 * alto acortaría el documento y el contenido daría un salto de 56 px a media lectura.
 *
 * Va en un solo bloque a propósito: si fueran dos elementos pegados por separado habría
 * que sincronizar sus alturas a mano, y cualquier cambio de una rompería a la otra.
 */
export default function LandingHeader({ activeTab, onSelect, tabRowRef }: ILandingHeaderProps) {
  const isCollapsed = useScrollDirection() === "down";

  return (
    <header
      className={cn(
        /* El borde inferior lo pone la fila de pestañas, para que su `offsetHeight`
           sea exactamente el alto que queda fijo arriba al plegarse. */
        "sticky top-0 z-20 bg-card/95 backdrop-blur transition-transform duration-200 ease-out motion-reduce:transition-none",
        isCollapsed ? "-translate-y-14" : "translate-y-0",
      )}
    >
      <div
        inert={isCollapsed}
        className={cn(
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          isCollapsed ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link to="/" aria-label="Electrolitos — inicio" className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-heading text-landing-title font-bold text-foreground">
              Electrolitos
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>

      <div ref={tabRowRef}>
        <LandingTabNav activeTab={activeTab} onSelect={onSelect} />
      </div>
    </header>
  );
}
