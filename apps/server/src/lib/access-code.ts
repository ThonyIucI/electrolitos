import { createDb } from "@electrolitos/db";
import { enrollments } from "@electrolitos/db/schema/students";
import { ACCESS_CODE_ALPHABET, ACCESS_CODE_LENGTH } from "@electrolitos/shared/access-code";
import { inArray } from "drizzle-orm";

const MAX_ATTEMPTS = 5;

/** Un código al azar del alfabeto sin ambigüedades (no distingue 0/O ni 1/I). */
const randomAccessCode = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(ACCESS_CODE_LENGTH));
  return Array.from(bytes, (byte) => ACCESS_CODE_ALPHABET[byte % ACCESS_CODE_ALPHABET.length]).join(
    "",
  );
};

/**
 * Genera `count` códigos únicos, verificando de una sola vez contra los ya usados.
 * Con 32^6 combinaciones la colisión es improbable, pero el código va impreso en una
 * tarjeta y es la contraseña del alumno: conviene comprobarlo.
 */
export const generateAccessCodes = async (count: number): Promise<string[]> => {
  const db = createDb();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidates = new Set<string>();
    while (candidates.size < count) {
      candidates.add(randomAccessCode());
    }

    const candidateList = [...candidates];
    const taken = await db
      .select({ accessCode: enrollments.accessCode })
      .from(enrollments)
      .where(inArray(enrollments.accessCode, candidateList))
      .all();

    if (taken.length === 0) {
      return candidateList;
    }
  }

  throw new Error("No se pudieron generar códigos de acceso únicos.");
};

export const generateAccessCode = async (): Promise<string> => {
  const [code] = await generateAccessCodes(1);
  if (!code) {
    throw new Error("No se pudo generar el código de acceso.");
  }
  return code;
};
