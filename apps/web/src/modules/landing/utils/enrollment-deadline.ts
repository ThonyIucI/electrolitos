import dayjs from "dayjs";

import { CAMPUSES, type ICampus } from "../constants/landing-campuses";

export interface IOpenCampus {
  campus: ICampus;
  /** 0 = cierra hoy. Nunca negativo: las sedes vencidas no entran en la lista. */
  daysLeft: number;
}

/**
 * Se compara contra el inicio del día en hora local: a las 11 de la noche del día del
 * cierre el plazo sigue abierto, no vencido desde el mediodía por la diferencia con UTC.
 */
export const daysUntil = (isoDate: string, now: Date = new Date()): number =>
  dayjs(isoDate).startOf("day").diff(dayjs(now).startOf("day"), "day");

/**
 * Sedes cuyo plazo de inscripción sigue abierto, de la más urgente a la menos.
 * Cuando todas vencen devuelve una lista vacía y el aviso desaparece solo: no hay que
 * acordarse de bajarlo a mano el día que pase la fecha.
 */
export const openCampuses = (now: Date = new Date()): IOpenCampus[] =>
  CAMPUSES.map((campus) => ({ campus, daysLeft: daysUntil(campus.enrollmentDeadline, now) }))
    .filter(({ daysLeft }) => daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

export const deadlineLabel = (daysLeft: number): string => {
  if (daysLeft === 0) {
    return "cierra hoy";
  }

  if (daysLeft === 1) {
    return "cierra mañana";
  }

  return `quedan ${daysLeft} días`;
};
