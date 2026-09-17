const MINUTES_PER_HOUR = 60;

/** 2 → "2 h", 0.5 → "30 min", 1.5 → "1 h 30 min". Devuelve null cuando no hay horas que mostrar. */
export const formatHours = (hours: number): string | null => {
  if (hours <= 0) {
    return null;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * MINUTES_PER_HOUR);

  if (wholeHours === 0) {
    return `${minutes} min`;
  }

  return minutes === 0 ? `${wholeHours} h` : `${wholeHours} h ${minutes} min`;
};
