import { createDb } from "@electrolitos/db";
import { courses } from "@electrolitos/db/schema/courses";
import { houses } from "@electrolitos/db/schema/houses";
import { enrollments } from "@electrolitos/db/schema/students";
import { ECourseStatus } from "@electrolitos/shared/courses";
import { DEFAULT_HOUSES } from "@electrolitos/shared/houses";
import type { ICourseDetailResource, ICourseResource } from "@electrolitos/shared/resources";
import { zValidator } from "@hono/zod-validator";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { TAppEnv } from "../lib/app-env";
import { notFound } from "../lib/errors";
import { newId } from "../lib/ids";
import { ok } from "../lib/response";
import { toHouseResource } from "../lib/serializers";
import { requireAdmin, requireStaff } from "../middleware/require-role";

export const COURSE_ROUTES = {
  ACTIVE: "/courses/active",
  LIST: "/courses",
  CREATE: "/courses",
  UPDATE: "/courses/:courseId",
} as const;

const CENTS_PER_SOL = 100;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const createCourseSchema = z.object({
  name: z.string().trim().min(3, "El nombre del taller es muy corto."),
  startsOn: z.string().regex(ISO_DATE, "Fecha de inicio inválida."),
  endsOn: z.string().regex(ISO_DATE, "Fecha de fin inválida."),
  capacity: z.number().int().min(1, "El cupo debe ser mayor a cero."),
  priceSoles: z.number().min(0, "El precio no puede ser negativo."),
});

/** Todos los campos son opcionales: el formulario manda solo lo que cambió. */
const updateCourseSchema = z
  .object({
    name: z.string().trim().min(3, "El nombre del taller es muy corto."),
    startsOn: z.string().regex(ISO_DATE, "Fecha de inicio inválida."),
    endsOn: z.string().regex(ISO_DATE, "Fecha de fin inválida."),
    capacity: z.number().int().min(1, "El cupo debe ser mayor a cero."),
    priceSoles: z.number().min(0, "El precio no puede ser negativo."),
    status: z.enum(ECourseStatus),
  })
  .partial();

const toCourseResource = (row: typeof courses.$inferSelect): ICourseResource => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  startsOn: row.startsOn,
  endsOn: row.endsOn,
  capacity: row.capacity,
  priceSoles: row.priceCents / CENTS_PER_SOL,
  status: row.status,
});

const slugify = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Un taller con sus casas y cuántos inscritos tiene. */
const findCourseDetail = async (courseId: string): Promise<ICourseDetailResource> => {
  const db = createDb();

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();

  if (!course) {
    throw notFound("No encontramos ese taller.");
  }

  const [courseHouses, enrolled] = await Promise.all([
    db.select().from(houses).where(eq(houses.courseId, courseId)).orderBy(asc(houses.sortOrder)),
    db.select({ total: count() }).from(enrollments).where(eq(enrollments.courseId, courseId)).get(),
  ]);

  return {
    ...toCourseResource(course),
    houses: courseHouses.map(toHouseResource),
    enrollmentCount: enrolled?.total ?? 0,
  };
};

export const courseRoutes = new Hono<TAppEnv>()
  /**
   * Todos los talleres, del más nuevo al más viejo. Desde que hay más de una sede puede
   * haber varias cohortes en curso a la vez, así que el panel trabaja con la lista y no
   * con «el taller activo».
   */
  .get(COURSE_ROUTES.LIST, requireStaff, async (context) => {
    const db = createDb();

    const rows = await db
      .select({ id: courses.id })
      .from(courses)
      .where(isNull(courses.deletedAt))
      .orderBy(desc(courses.createdAt));

    const details = await Promise.all(rows.map((row) => findCourseDetail(row.id)));

    return ok<ICourseDetailResource[]>(context, details);
  })

  /**
   * El taller vigente con sus casas. Devuelve `null` (no 404) cuando todavía no hay
   * ninguno: el front usa eso para ofrecer crearlo.
   */
  .get(COURSE_ROUTES.ACTIVE, requireStaff, async (context) => {
    const db = createDb();

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.status, ECourseStatus.ACTIVE), isNull(courses.deletedAt)))
      .orderBy(asc(courses.createdAt))
      .get();

    if (!course) {
      return ok<ICourseDetailResource | null>(context, null);
    }

    const [courseHouses, enrolled] = await Promise.all([
      db.select().from(houses).where(eq(houses.courseId, course.id)).orderBy(asc(houses.sortOrder)),
      db.select({ total: count() }).from(enrollments).where(eq(enrollments.courseId, course.id)).get(),
    ]);

    return ok<ICourseDetailResource>(context, {
      ...toCourseResource(course),
      houses: courseHouses.map(toHouseResource),
      enrollmentCount: enrolled?.total ?? 0,
    });
  })

  /** Crea el taller junto con sus cuatro casas, en un solo batch (D1 no tiene transacciones). */
  .post(COURSE_ROUTES.CREATE, requireAdmin, zValidator("json", createCourseSchema), async (context) => {
    const input = context.req.valid("json");
    const db = createDb();

    /*
      Antes se rechazaba un segundo taller activo. Se quitó al abrir la segunda sede:
      Samán y Ventarrones corren a la vez, con calendarios distintos.
    */
    const courseId = newId();
    const slug = `${slugify(input.name)}-${courseId.slice(0, 8)}`;

    await db.batch([
      db.insert(courses).values({
        id: courseId,
        name: input.name,
        slug,
        startsOn: input.startsOn,
        endsOn: input.endsOn,
        capacity: input.capacity,
        priceCents: Math.round(input.priceSoles * CENTS_PER_SOL),
        status: ECourseStatus.ACTIVE,
        createdBy: context.var.user.id,
      }),
      db.insert(houses).values(
        DEFAULT_HOUSES.map((house) => ({
          id: newId(),
          courseId,
          name: house.name,
          scientist: house.scientist,
          colorKey: house.colorKey,
          motto: house.motto,
          sortOrder: house.sortOrder,
        })),
      ),
    ]);

    return ok<ICourseDetailResource>(context, await findCourseDetail(courseId), 201);
  })

  /**
   * Edita el taller. Todo es opcional: el formulario manda lo que cambió.
   *
   * El `slug` **no se regenera** al renombrar: es un identificador estable y volver a
   * derivarlo del nombre solo serviría para chocar contra su índice único.
   */
  .patch(
    COURSE_ROUTES.UPDATE,
    requireAdmin,
    zValidator("json", updateCourseSchema),
    async (context) => {
      const courseId = context.req.param("courseId");
      const input = context.req.valid("json");
      const db = createDb();

      const current = await db
        .select({ id: courses.id })
        .from(courses)
        .where(and(eq(courses.id, courseId), isNull(courses.deletedAt)))
        .get();

      if (!current) {
        throw notFound("No encontramos ese taller.");
      }

      await db
        .update(courses)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.startsOn !== undefined && { startsOn: input.startsOn }),
          ...(input.endsOn !== undefined && { endsOn: input.endsOn }),
          ...(input.capacity !== undefined && { capacity: input.capacity }),
          ...(input.priceSoles !== undefined && {
            priceCents: Math.round(input.priceSoles * CENTS_PER_SOL),
          }),
          ...(input.status !== undefined && { status: input.status }),
        })
        .where(eq(courses.id, courseId));

      return ok<ICourseDetailResource>(context, await findCourseDetail(courseId));
    },
  );
