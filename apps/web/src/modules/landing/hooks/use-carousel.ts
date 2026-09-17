import { useCallback, useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 4500;

/**
 * Avance automático y circular. Se detiene si el usuario pidió menos movimiento o si
 * toma el control tocando un punto: a partir de ahí manda él, no el temporizador.
 */
export const useCarousel = (slideCount: number) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
  }, []);

  useEffect(() => {
    if (isPaused || slideCount < 2) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, slideCount]);

  return { activeIndex, goTo };
};
