import { cn } from "@electrolitos/ui/lib/utils";

const LOGO_ALT = "Electrolitos — taller de electrónica, robótica, programación y más";

interface IWordmarkProps {
  className?: string;
}

/**
 * Logo completo (chakana + lettering). Hay dos archivos porque el azul marino del
 * lettering desaparece sobre el fondo noche: la variante oscura lo lleva a tinta clara.
 */
export default function Wordmark({ className }: IWordmarkProps) {
  return (
    <>
      <img
        src="/logo-electrolitos.png"
        alt={LOGO_ALT}
        className={cn("object-contain dark:hidden", className)}
      />
      <img
        src="/logo-electrolitos-dark.png"
        alt={LOGO_ALT}
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  );
}
