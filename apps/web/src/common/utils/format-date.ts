const LONG_DATE = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** `"2026-09-12T..."` → `"12 de septiembre de 2026"`. */
export const formatLongDate = (isoDate: string): string => LONG_DATE.format(new Date(isoDate));
