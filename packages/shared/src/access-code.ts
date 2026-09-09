/**
 * Código de acceso del alumno: 6 caracteres de un alfabeto sin ambigüedades
 * (sin 0/O ni 1/I) para que se lea bien impreso en la tarjeta.
 */
export const ACCESS_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ACCESS_CODE_LENGTH = 6;

const ACCESS_CODE_REGEX = new RegExp(`^[${ACCESS_CODE_ALPHABET}]{${ACCESS_CODE_LENGTH}}$`);

/** Quita espacios/guiones y pasa a mayúsculas: "ama-7k3p" → "AMA7K3P". */
export const normalizeAccessCode = (raw: string): string =>
  raw.replace(/[\s-]/g, "").toUpperCase();

export const isValidAccessCode = (code: string): boolean => ACCESS_CODE_REGEX.test(code);

/** Formato para mostrar: "AMA7K3P" → "AMA·7K3P" (más fácil de leer y dictar). */
export const formatAccessCode = (code: string): string =>
  `${code.slice(0, 3)}·${code.slice(3)}`;
