import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type { TCourseStatus, TSessionStatus } from "@electrolitos/shared/courses";

import { user } from "./auth";

const nowMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

/**
 * Un curso = una cohorte del taller. `price_cents` guarda soles en céntimos (entero)
 * para no arrastrar decimales flotantes; es informativo.
 */
export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    startsOn: text("starts_on").notNull(),
    endsOn: text("ends_on").notNull(),
    capacity: integer("capacity").notNull(),
    priceCents: integer("price_cents").default(0).notNull(),
    status: text("status").$type<TCourseStatus>().default("ACTIVE").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("courses_status_idx").on(table.status)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    missionBrief: text("mission_brief"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }).notNull(),
    status: text("status").$type<TSessionStatus>().default("PLANNED").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("sessions_course_number_uidx").on(table.courseId, table.number)],
);

export const coursesRelations = relations(courses, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  course: one(courses, { fields: [sessions.courseId], references: [courses.id] }),
}));
