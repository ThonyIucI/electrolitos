import type { TAuth } from "@electrolitos/auth";
import { createDb } from "@electrolitos/db";
import { user } from "@electrolitos/db/schema/auth";
import { students } from "@electrolitos/db/schema/students";
import { EUserRole } from "@electrolitos/shared/roles";
import { eq } from "drizzle-orm";

/**
 * better-auth exige un correo único por usuario y el alumno no tiene uno. Se arma a
 * partir del código sobre un dominio reservado que no existe: nunca se le manda nada ni
 * se le muestra, solo satisface la restricción de la tabla.
 */
const STUDENT_EMAIL_DOMAIN = "alumno.electrolitos.local";

export const studentLoginEmail = (accessCode: string): string =>
  `${accessCode.toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;

/**
 * Crea el usuario de un alumno. La contraseña inicial es su propio código de acceso: el
 * chico entra con la tarjeta y la app lo obliga a elegir un PIN antes de mostrarle nada,
 * momento en el que el código deja de servir como contraseña.
 */
export const createStudentUser = async (
  auth: TAuth,
  { name, accessCode }: { name: string; accessCode: string },
): Promise<string> => {
  const created = await auth.api.signUpEmail({
    body: { email: studentLoginEmail(accessCode), password: accessCode, name },
  });

  const db = createDb();

  /*
    El rol y el username se escriben después del alta: `role` tiene `input: false` para
    que nadie pueda mandarlo desde el cliente, así que no se puede pasar en el signUp.
    El plugin `username` compara en minúsculas y muestra `displayUsername`.
  */
  await db
    .update(user)
    .set({
      role: EUserRole.STUDENT,
      username: accessCode.toLowerCase(),
      displayUsername: accessCode.toUpperCase(),
    })
    .where(eq(user.id, created.user.id));

  return created.user.id;
};

/**
 * Forma del contexto interno de better-auth que se usa para reescribir la contraseña sin
 * conocer la anterior. **Es API interna**: si una actualización de better-auth rompe el
 * restablecimiento de PIN, el cambio está acá y en ningún otro sitio.
 */
interface IAuthPasswordContext {
  password: { hash: (password: string) => Promise<string> };
  internalAdapter: { updatePassword: (userId: string, hashedPassword: string) => Promise<unknown> };
}

/** Escribe la contraseña de un usuario sin pedir la anterior. Solo para el reinicio del staff. */
export const overwriteUserPassword = async (
  auth: TAuth,
  userId: string,
  password: string,
): Promise<void> => {
  const context = (await auth.$context) as unknown as IAuthPasswordContext;
  const hashed = await context.password.hash(password);

  await context.internalAdapter.updatePassword(userId, hashed);
};

/**
 * Devuelve al alumno al estado de recién inscrito: su contraseña vuelve a ser el código
 * de la tarjeta y la app le pedirá elegir un PIN nuevo en el siguiente ingreso.
 */
export const resetStudentPin = async (
  auth: TAuth,
  { userId, studentId, accessCode }: { userId: string; studentId: string; accessCode: string },
): Promise<void> => {
  await overwriteUserPassword(auth, userId, accessCode);

  const db = createDb();
  await db.update(students).set({ pinSetAt: null }).where(eq(students.id, studentId));
};
