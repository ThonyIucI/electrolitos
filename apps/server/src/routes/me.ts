import { createDb } from "@electrolitos/db";
import { students } from "@electrolitos/db/schema/students";
import { EUserRole } from "@electrolitos/shared/roles";
import {
  STUDENT_PIN_MESSAGES,
  hasStudentPinFormat,
  isWeakStudentPin,
} from "@electrolitos/shared/student-pin";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { TAppEnv } from "../lib/app-env";
import { badRequest, unauthorized } from "../lib/errors";
import { ok } from "../lib/response";
import { requireAuth, requireStudent } from "../middleware/require-role";

export const ME_ROUTES = {
  ME: "/me",
  PIN: "/me/pin",
} as const;

const setPinSchema = z.object({
  /** El código de la tarjeta la primera vez; el PIN actual si lo está cambiando. */
  currentCredential: z.string().min(1, "Falta tu código o tu PIN actual."),
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
   * El alumno elige su PIN. Se exige la credencial actual (el código la primera vez) para
   * que una sesión robada no pueda cambiar el secreto y dejar al chico fuera de su cuenta.
   */
  .post(ME_ROUTES.PIN, requireStudent, zValidator("json", setPinSchema), async (context) => {
    const { currentCredential, pin } = context.req.valid("json");
    const user = context.var.user;

    try {
      await context.var.auth.api.changePassword({
        body: { currentPassword: currentCredential, newPassword: pin },
        headers: context.req.raw.headers,
      });
    } catch {
      /* Mensaje único a propósito: no se distingue «código malo» de «PIN malo». */
      throw unauthorized("Tu código o PIN actual no es correcto.");
    }

    const db = createDb();
    const updated = await db
      .update(students)
      .set({ pinSetAt: new Date() })
      .where(eq(students.userId, user.id))
      .returning({ id: students.id })
      .get();

    if (!updated) {
      throw badRequest("No encontramos tu ficha de alumno.");
    }

    return ok(context, { mustSetPin: false });
  });
