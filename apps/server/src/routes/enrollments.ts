import { createDb } from "@electrolitos/db";
import { courses } from "@electrolitos/db/schema/courses";
import { houses } from "@electrolitos/db/schema/houses";
import { enrollments, students } from "@electrolitos/db/schema/students";
import { EEnrollmentStatus } from "@electrolitos/shared/enrollments";
import type { IEnrollmentResource } from "@electrolitos/shared/resources";
import { zValidator } from "@hono/zod-validator";
import { and, asc, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { generateAccessCode } from "../lib/access-code";
import type { TAppEnv } from "../lib/app-env";
import { badRequest, notFound } from "../lib/errors";
import { newId } from "../lib/ids";
import { ok } from "../lib/response";
import { toEnrollmentResource } from "../lib/serializers";
import { requireStaff } from "../middleware/require-role";

export const ENROLLMENT_ROUTES = {
  LIST: "/courses/:courseId/enrollments",
  CREATE: "/courses/:courseId/enrollments",
  UPDATE: "/enrollments/:enrollmentId",
} as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_DIGITS = /^\d{6,15}$/;

/** Vacío del formulario → `null` en la base, para no guardar cadenas en blanco. */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null)
    .nullish()
    .transform((value) => value ?? null);

/**
 * Solo el nombre y el apellido son obligatorios: si a media clase falta el teléfono del
 * apoderado, el chico igual queda registrado y el dato se completa después.
 */
const studentInputSchema = z.object({
  firstName: z.string().trim().min(2, "El nombre es muy corto.").max(60, "El nombre es muy largo."),
  lastName: z.string().trim().min(2, "El apellido es muy corto.").max(60, "El apellido es muy largo."),
  nickname: optionalText(30, "El apodo es muy largo."),
  birthDate: z
    .string()
    .regex(ISO_DATE, "Fecha de nacimiento inválida.")
    .nullish()
    .transform((value) => value ?? null),
  guardianName: optionalText(80, "El nombre del apoderado es muy largo."),
  guardianPhone: optionalText(20, "El teléfono es muy largo").refine(
    (value) => value === null || PHONE_DIGITS.test(value.replace(/\D/g, "")),
    "El teléfono debe tener entre 6 y 15 dígitos.",
  ),
  notes: optionalText(500, "La nota es muy larga."),
});

const createEnrollmentSchema = z.union([
  z.object({
    student: studentInputSchema,
    houseId: z.string().nullish(),
  }),
  z.object({
    studentId: z.string().min(1),
    houseId: z.string().nullish(),
  }),
]);

const updateEnrollmentSchema = z.object({
  houseId: z.string().nullish(),
  status: z.enum(EEnrollmentStatus).optional(),
});

/** El curso debe existir y no estar borrado. */
const findCourseOrFail = async (courseId: string) => {
  const db = createDb();
  const course = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), isNull(courses.deletedAt)))
    .get();

  if (!course) {
    throw notFound("No encontramos ese taller.");
  }
  return course;
};

/** Una casa asignada tiene que pertenecer al mismo curso. */
const assertHouseBelongsToCourse = async (houseId: string, courseId: string) => {
  const db = createDb();
  const house = await db
    .select({ id: houses.id })
    .from(houses)
    .where(and(eq(houses.id, houseId), eq(houses.courseId, courseId)))
    .get();

  if (!house) {
    throw badRequest("Esa casa no pertenece al taller.");
  }
};

const findEnrollmentResource = async (enrollmentId: string): Promise<IEnrollmentResource> => {
  const db = createDb();
  const row = await db
    .select({ enrollment: enrollments, student: students, house: houses })
    .from(enrollments)
    .innerJoin(students, eq(students.id, enrollments.studentId))
    .leftJoin(houses, eq(houses.id, enrollments.houseId))
    .where(eq(enrollments.id, enrollmentId))
    .get();

  if (!row) {
    throw notFound("No encontramos esa inscripción.");
  }
  return toEnrollmentResource(row);
};

export const enrollmentRoutes = new Hono<TAppEnv>()
  /** Lista de inscritos del taller, ordenada por apellido. */
  .get(ENROLLMENT_ROUTES.LIST, requireStaff, async (context) => {
    const courseId = context.req.param("courseId");
    await findCourseOrFail(courseId);

    const db = createDb();
    const rows = await db
      .select({ enrollment: enrollments, student: students, house: houses })
      .from(enrollments)
      .innerJoin(students, eq(students.id, enrollments.studentId))
      .leftJoin(houses, eq(houses.id, enrollments.houseId))
      .where(and(eq(enrollments.courseId, courseId), isNull(students.deletedAt)))
      .orderBy(asc(students.lastName), asc(students.firstName));

    return ok(context, rows.map(toEnrollmentResource));
  })

  /**
   * Inscribe a un alumno. Acepta un alumno nuevo (`student`) o uno ya existente
   * (`studentId`); en el primer caso crea la ficha y la inscripción en un solo batch.
   */
  .post(
    ENROLLMENT_ROUTES.CREATE,
    requireStaff,
    zValidator("json", createEnrollmentSchema),
    async (context) => {
      const courseId = context.req.param("courseId");
      const input = context.req.valid("json");
      await findCourseOrFail(courseId);

      const houseId = input.houseId ?? null;
      if (houseId) {
        await assertHouseBelongsToCourse(houseId, courseId);
      }

      const db = createDb();
      const accessCode = await generateAccessCode();
      const enrollmentId = newId();

      if ("studentId" in input) {
        const student = await db
          .select({ id: students.id })
          .from(students)
          .where(and(eq(students.id, input.studentId), isNull(students.deletedAt)))
          .get();

        if (!student) {
          throw notFound("No encontramos a ese alumno.");
        }

        const already = await db
          .select({ id: enrollments.id })
          .from(enrollments)
          .where(
            and(eq(enrollments.courseId, courseId), eq(enrollments.studentId, input.studentId)),
          )
          .get();

        if (already) {
          return ok(context, await findEnrollmentResource(already.id));
        }

        await db.insert(enrollments).values({
          id: enrollmentId,
          courseId,
          studentId: input.studentId,
          houseId,
          accessCode,
        });
      } else {
        const studentId = newId();
        await db.batch([
          db.insert(students).values({ id: studentId, ...input.student }),
          db.insert(enrollments).values({
            id: enrollmentId,
            courseId,
            studentId,
            houseId,
            accessCode,
          }),
        ]);
      }

      return ok(context, await findEnrollmentResource(enrollmentId), 201);
    },
  )

  /** Cambia la casa o el estado de una inscripción. */
  .patch(
    ENROLLMENT_ROUTES.UPDATE,
    requireStaff,
    zValidator("json", updateEnrollmentSchema),
    async (context) => {
      const enrollmentId = context.req.param("enrollmentId");
      const input = context.req.valid("json");
      const db = createDb();

      const current = await db
        .select({ id: enrollments.id, courseId: enrollments.courseId })
        .from(enrollments)
        .where(eq(enrollments.id, enrollmentId))
        .get();

      if (!current) {
        throw notFound("No encontramos esa inscripción.");
      }

      const houseId = input.houseId ?? null;
      if (houseId) {
        await assertHouseBelongsToCourse(houseId, current.courseId);
      }

      await db
        .update(enrollments)
        .set({
          ...(input.houseId !== undefined && { houseId }),
          ...(input.status !== undefined && { status: input.status }),
        })
        .where(eq(enrollments.id, enrollmentId));

      return ok(context, await findEnrollmentResource(enrollmentId));
    },
  );
