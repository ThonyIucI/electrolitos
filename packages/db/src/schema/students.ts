import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type { TAttendanceStatus, TEnrollmentStatus } from "@electrolitos/shared/enrollments";

import { user } from "./auth";
import { courses, sessions } from "./courses";
import { houses } from "./houses";

const nowMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

/**
 * Ficha del alumno. Solo el nombre y el apellido son obligatorios: registrar a un chico
 * en medio de la clase no puede quedar bloqueado porque falte un teléfono, y el resto
 * de datos se completa después.
 *
 * `user_id` es nullable a propósito: el usuario de better-auth (login por código) se crea
 * recién en la Etapa 3, cuando exista la pantalla de ingreso del alumno.
 */
export const students = sqliteTable(
  "students",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" })
      .unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    nickname: text("nickname"),
    birthDate: text("birth_date"),
    guardianName: text("guardian_name"),
    guardianPhone: text("guardian_phone"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("students_last_name_idx").on(table.lastName)],
);

/** Inscripción de un alumno a un curso. Aquí vive el código de acceso y la casa. */
export const enrollments = sqliteTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    houseId: text("house_id").references(() => houses.id, { onDelete: "set null" }),
    accessCode: text("access_code").notNull().unique(),
    status: text("status").$type<TEnrollmentStatus>().default("ACTIVE").notNull(),
    paidCents: integer("paid_cents").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("enrollments_course_student_uidx").on(table.courseId, table.studentId),
    index("enrollments_course_idx").on(table.courseId),
    index("enrollments_house_idx").on(table.houseId),
  ],
);

/** Asistencia por sesión. No es un ledger: el estado se actualiza (upsert idempotente). */
export const attendances = sqliteTable(
  "attendances",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    status: text("status").$type<TAttendanceStatus>().notNull(),
    markedBy: text("marked_by")
      .notNull()
      .references(() => user.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("attendances_session_enrollment_uidx").on(table.sessionId, table.enrollmentId),
    index("attendances_session_idx").on(table.sessionId),
  ],
);

export const studentsRelations = relations(students, ({ many, one }) => ({
  enrollments: many(enrollments),
  user: one(user, { fields: [students.userId], references: [user.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  house: one(houses, { fields: [enrollments.houseId], references: [houses.id] }),
  attendances: many(attendances),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  session: one(sessions, { fields: [attendances.sessionId], references: [sessions.id] }),
  enrollment: one(enrollments, {
    fields: [attendances.enrollmentId],
    references: [enrollments.id],
  }),
}));
