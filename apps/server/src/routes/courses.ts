import { createDb } from "@electrolitos/db";
import { courses } from "@electrolitos/db/schema/courses";
import { houses } from "@electrolitos/db/schema/houses";
import { enrollments } from "@electrolitos/db/schema/students";
import { ECourseStatus } from "@electrolitos/shared/courses";
import { DEFAULT_HOUSES } from "@electrolitos/shared/houses";
import type { ICourseDetailResource, ICourseResource } from "@electrolitos/shared/resources";
import { zValidator } from "@hono/zod-validator";
import { and, asc, count, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { TAppEnv } from "../lib/app-env";
import { conflict } from "../lib/errors";
import { newId } from "../lib/ids";
import { ok } from "../lib/response";
import { toHouseResource } from "../lib/serializers";
import { requireAdmin, requireStaff } from "../middleware/require-role";

export const COURSE_ROUTES = {
  ACTIVE: "/courses/active",
  CREATE: "/courses",
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

export const courseRoutes = new Hono<TAppEnv>()
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

    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.status, ECourseStatus.ACTIVE), isNull(courses.deletedAt)))
      .get();

    if (existing) {
      throw conflict("Ya hay un taller en curso.");
    }

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

    const created = await db.select().from(courses).where(eq(courses.id, courseId)).get();
    const courseHouses = await db
      .select()
      .from(houses)
      .where(eq(houses.courseId, courseId))
      .orderBy(asc(houses.sortOrder));

    return ok<ICourseDetailResource>(
      context,
      {
        ...toCourseResource(created!),
        houses: courseHouses.map(toHouseResource),
        enrollmentCount: 0,
      },
      201,
    );
  });
