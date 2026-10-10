import { createDb } from "@electrolitos/db";
import { enrollments, students } from "@electrolitos/db/schema/students";
import { isValidAccessCode, normalizeAccessCode } from "@electrolitos/shared/access-code";
import { EEnrollmentStatus } from "@electrolitos/shared/enrollments";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { TAppEnv } from "../lib/app-env";
import { ok } from "../lib/response";
import { ensureStudentUser } from "../lib/student-user";

export const ACCESS_ROUTES = {
  STATUS: "/access/status",
} as const;

const statusQuerySchema = z.object({
  codigo: z.string().min(1, "Falta el código."),
});

const NEEDS_PIN = { status: "needs-pin" } as const;
const NEEDS_SETUP = { status: "needs-setup" } as const;

/**
 * Qué le toca hacer al chico que llega con un código, **sin pedirle que adivine**.
 *
 * Es pública a propósito: se consulta antes de tener sesión. Solo distingue dos
 * situaciones y nunca dice si el código existe:
 *
 * - `needs-setup`: el código es de alguien que todavía no eligió PIN. El front entra con
 *   el propio código y lo lleva a crearlo.
 * - `needs-pin`: ya tiene PIN, o el código no existe, está mal escrito o la inscripción
 *   no está activa. Se le pide el PIN y, si no cuadra, falla con el mensaje de siempre.
 *   Así de la respuesta no se puede deducir qué códigos son válidos.
 *
 * Lo único que se filtra es «este código no tiene PIN todavía», que es el caso en el que
 * el código **es** la contraseña. Para dar con uno al azar harían falta decenas de
 * millones de intentos sobre 32^6 combinaciones, y solo sirve en la ventana entre la
 * inscripción y el primer ingreso. Conviene igual una regla WAF sobre esta ruta.
 */
export const accessRoutes = new Hono<TAppEnv>().get(
  ACCESS_ROUTES.STATUS,
  zValidator("query", statusQuerySchema),
  async (context) => {
    const code = normalizeAccessCode(context.req.valid("query").codigo);

    if (!isValidAccessCode(code)) {
      return ok(context, NEEDS_PIN);
    }

    const db = createDb();
    const row = await db
      .select({
        studentId: students.id,
        userId: students.userId,
        pinSetAt: students.pinSetAt,
        firstName: students.firstName,
        lastName: students.lastName,
      })
      .from(enrollments)
      .innerJoin(students, eq(students.id, enrollments.studentId))
      .where(
        and(eq(enrollments.accessCode, code), eq(enrollments.status, EEnrollmentStatus.ACTIVE)),
      )
      .get();

    if (!row) {
      return ok(context, NEEDS_PIN);
    }

    if (row.pinSetAt) {
      return ok(context, NEEDS_PIN);
    }

    /*
      Inscripción sin usuario: o es anterior a que existiera el ingreso de alumnos, o la
      creación falló a media inscripción. Se le crea acá, en el primer intento de entrar.

      Sí, es un GET que escribe. La alternativa era devolver `needs-pin` y dejar al chico
      pidiéndole un PIN que no existe hasta que alguien se diera cuenta: un callejón sin
      salida garantizado a cambio de la pureza del verbo. No abre ninguna puerta nueva
      — solo completa una cuenta que ya debería existir para una inscripción que ya existe
      — y `ensureStudentUser` lo vuelve idempotente, incluso si la cuenta quedó creada
      pero sin enlazar.
    */
    if (!row.userId) {
      const userId = await ensureStudentUser(context.var.auth, {
        name: `${row.firstName} ${row.lastName}`,
        accessCode: code,
      });

      await db.update(students).set({ userId }).where(eq(students.id, row.studentId));
    }

    return ok(context, NEEDS_SETUP);
  },
);
