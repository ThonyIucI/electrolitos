import { cn } from "@electrolitos/ui/lib/utils";
import type { ReactNode } from "react";

import { useReveal } from "../hooks/use-reveal";

interface IRevealProps {
  children: ReactNode;
  /** Retraso en ms para escalonar hermanos dentro de una misma sección. */
  delay?: number;
  className?: string;
}

/**
 * Entrada suave al scrollear: sube 16 px y aparece. Solo `opacity` y `transform`,
 * como manda el design system, y con `motion-reduce` desactivado por completo.
 */
export default function Reveal({ children, delay = 0, className }: IRevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
