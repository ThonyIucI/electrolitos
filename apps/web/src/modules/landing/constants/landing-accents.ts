/**
 * Los cuatro colores de los afiches (azul, verde, ámbar, rojo) ya viven como tokens.
 * Aquí solo se mapean a clases para usarlos con moderación: un ícono, un filo, un chip.
 * Nunca como fondo de una sección entera — la portada tiene que leerse, no gritar.
 */
export const LANDING_ACCENTS = {
  primary: {
    icon: "bg-primary/12 text-primary",
    edge: "border-l-primary",
    chip: "bg-primary/12 text-primary",
    dot: "bg-primary",
  },
  success: {
    icon: "bg-success/12 text-success",
    edge: "border-l-success",
    chip: "bg-success/12 text-success",
    dot: "bg-success",
  },
  spark: {
    icon: "bg-spark/20 text-spark-foreground dark:text-spark",
    edge: "border-l-spark",
    chip: "bg-spark/20 text-spark-foreground dark:text-spark",
    dot: "bg-spark",
  },
  destructive: {
    icon: "bg-destructive/12 text-destructive",
    edge: "border-l-destructive",
    chip: "bg-destructive/12 text-destructive",
    dot: "bg-destructive",
  },
  info: {
    icon: "bg-info/12 text-info",
    edge: "border-l-info",
    chip: "bg-info/12 text-info",
    dot: "bg-info",
  },
} as const;

export type TLandingAccent = keyof typeof LANDING_ACCENTS;
