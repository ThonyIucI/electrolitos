import { useEffect, useRef, useState } from "react";

const REVEAL_THRESHOLD = 0.12;
/** Dispara un poco antes de que el bloque toque el borde inferior: se siente natural al scrollear. */
const REVEAL_ROOT_MARGIN = "0px 0px -8% 0px";

/**
 * Marca un elemento como visible la primera vez que entra en pantalla y deja de observarlo.
 * Si el usuario pidió menos movimiento, o el navegador no soporta IntersectionObserver,
 * el contenido aparece de una: la portada nunca depende de la animación para leerse.
 */
export const useReveal = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};
