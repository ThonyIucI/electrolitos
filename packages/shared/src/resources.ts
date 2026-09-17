/**
 * Formas que viajan por la API, espejo de `planning/contract/API.md`.
 * Las comparten el server (al serializar) y el front (al consumir), así un cambio
 * de contrato rompe el build en vez de romperse en producción.
 */
import type { TCourseStatus } from "./courses";
import type { TAttendanceStatus, TEnrollmentStatus } from "./enrollments";
import type { THouseColor } from "./houses";

export interface ICourseResource {
  id: string;
  name: string;
  slug: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  priceSoles: number;
  status: TCourseStatus;
}

export interface IHouseResource {
  id: string;
  name: string;
  scientist: string;
  colorKey: THouseColor;
  motto: string | null;
  sortOrder: number;
}

export interface ICourseDetailResource extends ICourseResource {
  houses: IHouseResource[];
  enrollmentCount: number;
}

/** Datos del alumno. `guardianPhone` y `notes` son solo para staff. */
export interface IStudentResource {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  birthDate: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  notes: string | null;
}

export interface IEnrollmentResource {
  id: string;
  courseId: string;
  student: IStudentResource;
  house: IHouseResource | null;
  /** Nunca se serializa hacia un alumno, solo hacia staff. */
  accessCode: string;
  status: TEnrollmentStatus;
  paidSoles: number;
  totalXp: number;
}

export interface IAttendanceResource {
  enrollmentId: string;
  sessionId: string;
  status: TAttendanceStatus;
  updatedAt: string;
}
