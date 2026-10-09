/**
 * PIN del alumno: 4 dígitos que reemplazan al código de acceso como contraseña.
 *
 * El código va impreso en la tarjeta, así que sirve para identificar pero no para
 * guardar un secreto: cualquiera que vea la tarjeta entraría. El PIN lo elige el chico
 * en su primer ingreso y solo él lo sabe; si se le olvida, el profesor lo restablece.
 */
export const STUDENT_PIN_LENGTH = 4;

const PIN_REGEX = new RegExp(`^\\d{${STUDENT_PIN_LENGTH}}$`);

/** Solo la forma: 4 dígitos. Se comprueba antes que la fortaleza para dar el mensaje correcto. */
export const hasStudentPinFormat = (pin: string): boolean => PIN_REGEX.test(pin);

/** Todos los dígitos iguales: 0000, 1111, … */
const isRepeatedDigits = (pin: string): boolean => new Set(pin).size === 1;

/** Secuencia corrida hacia arriba o hacia abajo: 1234, 4321, 6789… */
const isSequential = (pin: string): boolean => {
  const steps = [...pin].slice(1).map((digit, index) => Number(digit) - Number(pin[index]));

  return steps.every((step) => step === 1) || steps.every((step) => step === -1);
};

/**
 * Se rechazan solo los dos patrones que adivinaría un compañero al primer intento.
 * Nada más: a esta edad cada regla extra es un PIN olvidado y un reinicio en clase.
 */
export const isWeakStudentPin = (pin: string): boolean =>
  isRepeatedDigits(pin) || isSequential(pin);

export const isValidStudentPin = (pin: string): boolean =>
  PIN_REGEX.test(pin) && !isWeakStudentPin(pin);

export const STUDENT_PIN_MESSAGES = {
  format: `El PIN debe tener ${STUDENT_PIN_LENGTH} números.`,
  weak: "Ese PIN es muy fácil de adivinar. Elige otro.",
  mismatch: "Los dos PIN no son iguales.",
} as const;
