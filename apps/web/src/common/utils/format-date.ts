import dayjs from "dayjs";
import "dayjs/locale/es";
import updateLocale from "dayjs/plugin/updateLocale";

/** Locale de toda la app. Se cambia acá y afecta a todas las fechas. */
export const APP_LOCALE = "es";

/**
 * El locale `es` de dayjs abrevia septiembre como «sept.» (cuatro letras y un punto),
 * que en una tarjeta angosta empuja la fecha a dos líneas. Se reemplazan las
 * abreviaturas por las de tres letras, sin punto.
 */
const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

dayjs.extend(updateLocale);
dayjs.locale(APP_LOCALE);
dayjs.updateLocale(APP_LOCALE, { monthsShort: MONTHS_SHORT });

/**
 * `"2026-09-12"` → `"12 sep 2026"`. Es la que va en las tarjetas: entra en una línea
 * aunque la pantalla sea de 320 px.
 */
export const formatShortDate = (date: string | Date): string =>
  dayjs(date).format("DD MMM YYYY");

/** `"2026-09-12"` → `"12 de septiembre de 2026"`. Para textos corridos, no para tarjetas. */
export const formatLongDate = (date: string | Date): string =>
  dayjs(date).format("DD [de] MMMM [de] YYYY");

/** Hoy como `YYYY-MM-DD`, para valores por defecto y `min`/`max` de los `<input type="date">`. */
export const todayIso = (): string => dayjs().format("YYYY-MM-DD");
