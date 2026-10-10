import type { TAuth } from "@electrolitos/auth";
import { createDb } from "@electrolitos/db";
import { session, user } from "@electrolitos/db/schema/auth";
import { enrollments, students } from "@electrolitos/db/schema/students";
import { EUserRole } from "@electrolitos/shared/roles";
import { eq } from "drizzle-orm";

import { generateAccessCode } from "./access-code";

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
 * chico entra con ese código y la app lo obliga a elegir un PIN antes de mostrarle nada,
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
 * El usuario del alumno, creándolo solo si de verdad falta.
 *
 * No alcanza con mirar `students.user_id`: puede estar en null y existir igual el usuario,
 * si la inscripción se cortó justo entre crear la cuenta y enlazarla. Como el username es
 * el código y el código es único, un usuario con ese username **es** este alumno, así que
 * se reutiliza en vez de chocar contra el correo único.
 */
export const ensureStudentUser = async (
  auth: TAuth,
  { name, accessCode }: { name: string; accessCode: string },
): Promise<string> => {
  const db = createDb();
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.username, accessCode.toLowerCase()))
    .get();

  return existing ? existing.id : createStudentUser(auth, { name, accessCode });
};

/**
 * Forma del contexto interno de better-auth que se usa para reescribir la contraseña sin
 * conocer la anterior. **Es API interna**: si una actualización de better-auth rompe el
 * restablecimiento de credenciales, el cambio está acá y en ningún otro sitio.
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
 * Le da al alumno un código nuevo y borra su PIN: vuelve al estado de recién inscrito.
 *
 * Se cambia el código entero, no solo el PIN, porque el motivo de fondo suele ser que la
 * credencial anterior se perdió o anduvo circulando. El código viejo queda muerto en el
 * acto. **Nada de su contenido se toca**: la inscripción, la casa, la asistencia y el XP
 * cuelgan de `enrollment_id`, no del código, así que el chico vuelve a entrar y encuentra
 * todo igual.
 *
 * Devuelve el código nuevo para que el profesor pueda enviárselo de inmediato.
 */
export const regenerateStudentAccess = async (
  auth: TAuth,
  { userId, studentId, enrollmentId }: { userId: string; studentId: string; enrollmentId: string },
): Promise<string> => {
  const accessCode = await generateAccessCode();
  const db = createDb();

  await db.batch([
    db.update(enrollments).set({ accessCode }).where(eq(enrollments.id, enrollmentId)),
    /* El correo sintético se deriva del código: si no se actualiza, deja de cuadrar. */
    db
      .update(user)
      .set({
        username: accessCode.toLowerCase(),
        displayUsername: accessCode.toUpperCase(),
        email: studentLoginEmail(accessCode),
      })
      .where(eq(user.id, userId)),
    db.update(students).set({ pinSetAt: null }).where(eq(students.id, studentId)),
    /*
      Se cierran las sesiones abiertas: si el motivo fue que la credencial circuló, dejar
      viva una sesión en otro celular haría inútil el cambio. Se borran con Drizzle y no
      con el adaptador interno de better-auth porque la tabla es nuestra y está tipada.
    */
    db.delete(session).where(eq(session.userId, userId)),
  ]);

  /*
    La contraseña va fuera del batch porque la escribe better-auth. D1 no tiene
    transacciones interactivas, así que si esto falla el alumno queda con el código nuevo
    y la contraseña vieja y no puede entrar. La salida es volver a generarle un código:
    la operación es idempotente en la práctica.
  */
  await overwriteUserPassword(auth, userId, accessCode);

  return accessCode;
};
