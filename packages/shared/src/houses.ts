/**
 * Colores de casa. Los cuatro primeros son los cuadrantes de la chakana del logo;
 * morado y naranja quedan de reserva. Es un dato de identidad, no un tema:
 * el color nunca va solo, siempre acompañado del nombre de la casa.
 */
export enum EHouseColor {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED",
  BLUE = "BLUE",
  PURPLE = "PURPLE",
  ORANGE = "ORANGE",
}

export type THouseColor = `${EHouseColor}`;

export const houseColorLabels: Record<THouseColor, string> = {
  [EHouseColor.GREEN]: "Verde",
  [EHouseColor.YELLOW]: "Ámbar",
  [EHouseColor.RED]: "Rojo",
  [EHouseColor.BLUE]: "Azul",
  [EHouseColor.PURPLE]: "Morado",
  [EHouseColor.ORANGE]: "Naranja",
};

/**
 * Las cuatro casas del taller, una por cuadrante de la chakana, nombradas con
 * científicos peruanos. Se crean junto con el curso.
 */
export const DEFAULT_HOUSES = [
  {
    name: "Paulet",
    scientist: "Pedro Paulet",
    colorKey: EHouseColor.RED,
    motto: "Los que encienden el motor",
    sortOrder: 1,
  },
  {
    name: "Antúnez",
    scientist: "Santiago Antúnez de Mayolo",
    colorKey: EHouseColor.BLUE,
    motto: "Los que traen la energía",
    sortOrder: 2,
  },
  {
    name: "Villarreal",
    scientist: "Federico Villarreal",
    colorKey: EHouseColor.GREEN,
    motto: "Los que resuelven el número",
    sortOrder: 3,
  },
  {
    name: "Reiche",
    scientist: "María Reiche",
    colorKey: EHouseColor.YELLOW,
    motto: "Los que leen las señales",
    sortOrder: 4,
  },
] as const;
