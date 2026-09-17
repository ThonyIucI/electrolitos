import type { houses } from "@electrolitos/db/schema/houses";
import type { enrollments, students } from "@electrolitos/db/schema/students";
import type {
  IEnrollmentResource,
  IHouseResource,
  IStudentResource,
} from "@electrolitos/shared/resources";

const CENTS_PER_SOL = 100;

export const toHouseResource = (row: typeof houses.$inferSelect): IHouseResource => ({
  id: row.id,
  name: row.name,
  scientist: row.scientist,
  colorKey: row.colorKey,
  motto: row.motto,
  sortOrder: row.sortOrder,
});

export const toStudentResource = (row: typeof students.$inferSelect): IStudentResource => ({
  id: row.id,
  firstName: row.firstName,
  lastName: row.lastName,
  nickname: row.nickname,
  birthDate: row.birthDate,
  guardianName: row.guardianName,
  guardianPhone: row.guardianPhone,
  notes: row.notes,
});

interface IEnrollmentRow {
  enrollment: typeof enrollments.$inferSelect;
  student: typeof students.$inferSelect;
  house: typeof houses.$inferSelect | null;
  totalXp?: number;
}

/** Incluye `accessCode`: solo se usa en respuestas hacia staff. */
export const toEnrollmentResource = ({
  enrollment,
  student,
  house,
  totalXp = 0,
}: IEnrollmentRow): IEnrollmentResource => ({
  id: enrollment.id,
  courseId: enrollment.courseId,
  student: toStudentResource(student),
  house: house ? toHouseResource(house) : null,
  accessCode: enrollment.accessCode,
  status: enrollment.status,
  paidSoles: enrollment.paidCents / CENTS_PER_SOL,
  totalXp,
});
