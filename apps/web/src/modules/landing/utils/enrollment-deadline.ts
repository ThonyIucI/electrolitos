import { CAMPUSES, type ICampus } from "../constants/landing-campuses";

const MS_PER_DAY = 86_400_000;

export interface IOpenCampus {
  campus: ICampus;
  /** 0 = cierra hoy. Nunca negativo: las sedes vencidas no entran en la lista. */
  daysLeft: number;
}

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/*
  La fecha se parte a mano en lugar de `new Date("2026-09-19")`: ese formato se interpreta
  como UTC y en Perú (UTC-5) devolvería el día anterior.
*/
const parseIsoDate = (isoDate: string): number => {
  const [year, month, day] = isoDate.split("-").map(Number);

  return new Date(year, month - 1, day).getTime();
};

export const daysUntil = (isoDate: string, now: Date = new Date()): number =>
  Math.round((parseIsoDate(isoDate) - startOfDay(now)) / MS_PER_DAY);

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
