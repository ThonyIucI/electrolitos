import { cn } from "@electrolitos/ui/lib/utils";
import { useEffect, useRef } from "react";

import {
  LANDING_TABS,
  type TLandingTab,
  tabButtonId,
  tabPanelId,
} from "../constants/landing-tabs";

interface ILandingTabNavProps {
  activeTab: TLandingTab;
  onSelect: (tab: TLandingTab) => void;
}

const nextTab = (current: TLandingTab, step: number): TLandingTab => {
  const index = LANDING_TABS.findIndex((tab) => tab.key === current);
  const nextIndex = (index + step + LANDING_TABS.length) % LANDING_TABS.length;

  return LANDING_TABS[nextIndex].key;
};

/**
 * Navegación de la portada: la segunda fila de `LandingHeader`. Se desplaza en horizontal
 * porque en un celular no entran diez pestañas, pero sí se alcanzan todas con el pulgar.
 */
export default function LandingTabNav({ activeTab, onSelect }: ILandingTabNavProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  /*
    Se centra la pestaña activa moviendo solo la tira horizontal. `scrollIntoView` habría
    sido más corto, pero también mueve el scroll vertical de la página y pelea con el
    reposicionamiento que hace la portada al cambiar de pestaña.
  */
  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;

    if (!list || !active) {
      return;
    }

    list.scrollTo({
      left: active.offsetLeft - (list.clientWidth - active.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [activeTab]);

  return (
    /* Quien se pega al tope es `LandingHeader`; esta es solo su segunda fila. */
    <div className="w-full min-w-0 border-b-2 border-border">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Secciones del taller"
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
            return;
          }

          event.preventDefault();
          onSelect(nextTab(activeTab, event.key === "ArrowRight" ? 1 : -1));
        }}
        className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {LANDING_TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              ref={isActive ? activeRef : undefined}
              type="button"
              role="tab"
              id={tabButtonId(tab.key)}
              aria-selected={isActive}
              aria-controls={tabPanelId(tab.key)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(tab.key)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 font-heading text-landing-body font-bold whitespace-nowrap transition-colors focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
