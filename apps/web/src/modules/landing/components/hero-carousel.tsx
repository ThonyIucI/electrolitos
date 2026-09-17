import { cn } from "@electrolitos/ui/lib/utils";

import { HERO_SLIDES } from "../constants/landing-content";
import { useCarousel } from "../hooks/use-carousel";

/** Tres imágenes que resumen el taller: la placa, el código y la idea. Solo fundido, sin JS pesado. */
export default function HeroCarousel() {
  const { activeIndex, goTo } = useCarousel(HERO_SLIDES.length);

  return (
    <div className="w-full">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted shadow-sticker-md">
        {HERO_SLIDES.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            loading={index === 0 ? "eager" : "lazy"}
            aria-hidden={index === activeIndex ? undefined : true}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Ver imagen ${index + 1} de ${HERO_SLIDES.length}`}
            aria-current={index === activeIndex}
            className={cn(
              "h-2 rounded-full transition-all focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none",
              index === activeIndex ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground",
            )}
          />
        ))}
      </div>
    </div>
  );
}
