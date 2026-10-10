import { createDb } from "@electrolitos/db";
import { courses } from "@electrolitos/db/schema/courses";
import { houses } from "@electrolitos/db/schema/houses";
import { enrollments, students } from "@electrolitos/db/schema/students";
import { EEnrollmentStatus } from "@electrolitos/shared/enrollments";
import type { IStudentCardResource } from "@electrolitos/shared/resources";
import { EUserRole } from "@electrolitos/shared/roles";
import {
  STUDENT_PIN_MESSAGES,
  hasStudentPinFormat,
  isWeakStudentPin,
} from "@electrolitos/shared/student-pin";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { TAppEnv } from "../lib/app-env";
import { badRequest, notFound, unauthorized } from "../lib/errors";
import { ok } from "../lib/response";
import { toHouseResource } from "../lib/serializers";
import { overwriteUserPassword } from "../lib/student-user";
import { requireAuth, requireStudent } from "../middleware/require-role";

export const ME_ROUTES = {
  ME: "/me",
  PIN: "/me/pin",
  CARD: "/me/card",
} as const;

const setPinSchema = z.object({
  /** Solo al cambiarlo. Al crear el primero no se pide nada más. */
  currentPin: z.string().optional(),
  /* La forma se revisa antes que la fortaleza: un «12» es formato, no un PIN débil. */
  pin: z.string().superRefine((pin, ctx) => {
    if (!hasStudentPinFormat(pin)) {
      ctx.addIssue({ code: "custom", message: STUDENT_PIN_MESSAGES.format });
      return;
    }

    if (isWeakStudentPin(pin)) {
      ctx.addIssue({ code: "custom", message: STUDENT_PIN_MESSAGES.weak });
    }
  }),
});

/** `pin_set_at` null = todavía entra con el código impreso y debe elegir un PIN. */
const studentMustSetPin = async (userId: string): Promise<boolean> => {
  const db = createDb();
  const row = await db
    .select({ pinSetAt: students.pinSetAt })
    .from(students)
    .where(eq(students.userId, userId))
    .get();

  return row ? row.pinSetAt === null : false;
};

export const meRoutes = new Hono<TAppEnv>()
  /** Identidad del usuario autenticado. Nunca devuelve el código de acceso. */
  .get(ME_ROUTES.ME, requireAuth, async (context) => {
    const user = context.var.user;
    const isStudent = user.role === EUserRole.STUDENT;

    return ok(context, {
      id: user.id,
      name: user.name,
      role: user.role,
      email: isStudent ? null : user.email,
      /*
        Para un alumno el username ES su código de acceso, que mientras no elija PIN es
        también su contraseña: no sale de acá. (El objeto de sesión de better-auth sí lo
        trae, así que esto reduce la exposición, no la elimina.)
      */
      username: isStudent ? null : (user.displayUsername ?? null),
      mustSetPin: isStudent ? await studentMustSetPin(user.id) : false,
    });
  })

  /**
   * Crea o cambia el PIN del alumno.
   *
   * El **primero** no pide nada más que el PIN: para tener esta sesión ya hubo que usar el
   * código, así que volver a pedirlo no protegería de nada y son dos campos menos para un
   * chico de diez años. **Cambiarlo** después sí exige el PIN actual, que es lo que impide
   * que alguien agarre el celular desbloqueado y lo deje fuera de su propia cuenta.
   */
  .post(ME_ROUTES.PIN, requireStudent, zValidator("json", setPinSchema), async (context) => {
    const { currentPin, pin } = context.req.valid("json");
    const user = context.var.user;
    const db = createDb();

    const student = await db
      .select({ id: students.id, pinSetAt: students.pinSetAt })
      .from(students)
      .where(eq(students.userId, user.id))
      .get();

    if (!student) {
      throw badRequest("No encontramos tu ficha de alumno.");
    }

    if (student.pinSetAt) {
      if (!currentPin) {
        throw badRequest("Escribe tu PIN actual.");
      }

      try {
        await context.var.auth.api.changePassword({
          body: { currentPassword: currentPin, newPassword: pin },
          headers: context.req.raw.headers,
        });
      } catch {
        throw unauthorized("Tu PIN actual no es correcto.");
      }
    } else {
      await overwriteUserPassword(context.var.auth, user.id, pin);
    }

    await db.update(students).set({ pinSetAt: new Date() }).where(eq(students.id, student.id));

    return ok(context, { mustSetPin: false });
  })

  /**
   * El carnet del alumno: su identidad dentro del taller. Devuelve su inscripción activa
   * más reciente; si todavía no tiene ninguna, 404 con un mensaje que se puede mostrar.
   */
  .get(ME_ROUTES.CARD, requireStudent, async (context) => {
    const db = createDb();

    const row = await db
      .select({
        firstName: students.firstName,
        lastName: students.lastName,
        nickname: students.nickname,
        pinSetAt: students.pinSetAt,
        accessCode: enrollments.accessCode,
        enrolledAt: enrollments.createdAt,
        courseName: courses.name,
        house: houses,
      })
      .from(enrollments)
      .innerJoin(students, eq(students.id, enrollments.studentId))
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .leftJoin(houses, eq(houses.id, enrollments.houseId))
      .where(
        and(
          eq(students.userId, context.var.user.id),
          eq(enrollments.status, EEnrollmentStatus.ACTIVE),
        ),
      )
      .orderBy(desc(enrollments.createdAt))
      .get();

    if (!row) {
      throw notFound("Todavía no estás inscrito en ningún taller.");
    }

    const card: IStudentCardResource = {
      fullName: `${row.firstName} ${row.lastName}`,
      nickname: row.nickname,
      /* El código solo se le muestra una vez que su cuenta está protegida por el PIN. */
      accessCode: row.pinSetAt ? row.accessCode : null,
      house: row.house ? toHouseResource(row.house) : null,
      courseName: row.courseName,
      enrolledAt: row.enrolledAt.toISOString(),
    };

    return ok(context, card);
  });
