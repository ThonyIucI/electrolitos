import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { THouseColor } from "@electrolitos/shared/houses";

import { courses } from "./courses";

const nowMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

/** Casas del curso: los cuatro cuadrantes de la chakana, con un científico peruano cada una. */
export const houses = sqliteTable(
  "houses",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    scientist: text("scientist").notNull(),
    colorKey: text("color_key").$type<THouseColor>().notNull(),
    motto: text("motto"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("houses_course_idx").on(table.courseId)],
);

export const housesRelations = relations(houses, ({ one }) => ({
  course: one(courses, { fields: [houses.courseId], references: [courses.id] }),
}));
