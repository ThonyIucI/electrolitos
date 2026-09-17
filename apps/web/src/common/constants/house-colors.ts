import { EHouseColor, type THouseColor } from "@electrolitos/shared/houses";

interface IHouseColorClasses {
  /** Relleno sólido con su texto legible encima. */
  solid: string;
  /** Versión suave para chips y fondos de tarjeta. */
  soft: string;
  /** Solo el color, para puntos e íconos. */
  dot: string;
}

/**
 * Los cuatro cuadrantes de la chakana. El color nunca va solo: siempre acompañado
 * del nombre de la casa (DESIGN_SYSTEM §2).
 */
export const houseColorClasses: Record<THouseColor, IHouseColorClasses> = {
  [EHouseColor.GREEN]: {
    solid: "bg-house-green text-white",
    soft: "bg-house-green/12 text-house-green",
    dot: "bg-house-green",
  },
  [EHouseColor.YELLOW]: {
    solid: "bg-house-yellow text-spark-foreground",
    soft: "bg-house-yellow/18 text-spark-foreground dark:text-house-yellow",
    dot: "bg-house-yellow",
  },
  [EHouseColor.RED]: {
    solid: "bg-house-red text-white",
    soft: "bg-house-red/12 text-house-red",
    dot: "bg-house-red",
  },
  [EHouseColor.BLUE]: {
    solid: "bg-house-blue text-white",
    soft: "bg-house-blue/12 text-house-blue",
    dot: "bg-house-blue",
  },
  [EHouseColor.PURPLE]: {
    solid: "bg-house-purple text-white",
    soft: "bg-house-purple/12 text-house-purple",
    dot: "bg-house-purple",
  },
  [EHouseColor.ORANGE]: {
    solid: "bg-house-orange text-spark-foreground",
    soft: "bg-house-orange/18 text-spark-foreground dark:text-house-orange",
    dot: "bg-house-orange",
  },
};
