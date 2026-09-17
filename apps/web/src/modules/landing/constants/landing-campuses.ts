import type { TLandingAccent } from "./landing-accents";

export interface ICampus {
  key: string;
  name: string;
  place: string;
  schedule: string;
  accent: TLandingAccent;
  /** Las dos sesiones de cortesía, en orden. */
  freeSessions: readonly string[];
  courseStart: string;
  courseEnd: string;
}

/**
 * Dos sedes con calendarios distintos: en Samán el taller ya arrancó, en Ventarrones
 * empieza el domingo 20. Las 8 semanas se cuentan recién después de las dos sesiones
 * de cortesía, por eso el inicio del curso cae una semana después de la segunda.
 */
export const CAMPUSES: readonly ICampus[] = [
  {
    key: "saman",
    name: "Samán",
    place: "Biblioteca de Samán",
    schedule: "Sábados de 9:00 a 12:00",
    accent: "primary",
    freeSessions: ["Sábado 12 de setiembre", "Sábado 19 de setiembre"],
    courseStart: "Sábado 26 de setiembre",
    courseEnd: "Sábado 14 de noviembre",
  },
  {
    key: "ventarrones",
    name: "Ventarrones",
    place: "San Juan de la Virgen — Ventarrones y alrededores",
    schedule: "Domingos de 9:00 a 12:00",
    accent: "success",
    freeSessions: ["Domingo 20 de setiembre", "Domingo 27 de setiembre"],
    courseStart: "Domingo 4 de octubre",
    courseEnd: "Domingo 22 de noviembre",
  },
];
