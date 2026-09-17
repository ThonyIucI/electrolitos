import { HERO_HIGHLIGHTS } from "../constants/landing-content";

/**
 * Una sola fila que se desplaza sola. La lista va duplicada y la animación recorre
 * exactamente la mitad, así el salto al reiniciar es invisible. El duplicado se oculta
 * a lectores de pantalla para no leer todo dos veces.
 */
export default function HighlightsMarquee() {
  return (
    /* `w-full min-w-0` es obligatorio: sin eso el `w-max` de dentro propaga su ancho
       máximo hacia arriba y estira la página entera, aunque el `overflow-hidden` lo tape. */
    <div className="w-full min-w-0 overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      {/* Sin `gap` entre las dos copias: el desplazamiento es exactamente el 50 % y
          cualquier separación extra desalinearía el reinicio. Separa el `pr-2` de dentro. */}
      <ul className="flex w-max animate-marquee motion-reduce:paused">
        {[0, 1].map((copy) => (
          <li key={copy} aria-hidden={copy === 1 ? true : undefined}>
            <ul className="flex gap-2 pr-2">
              {HERO_HIGHLIGHTS.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-full bg-secondary px-3 py-1.5 text-landing-body font-bold whitespace-nowrap text-secondary-foreground"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
