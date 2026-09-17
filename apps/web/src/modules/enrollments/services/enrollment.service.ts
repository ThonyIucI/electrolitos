import type {
  ICourseDetailResource,
  IEnrollmentResource,
} from "@electrolitos/shared/resources";

import { apiRequest } from "@/lib/api";

export interface ICreateCoursePayload {
  name: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  priceSoles: number;
}

export interface ICreateStudentPayload {
  firstName: string;
  lastName: string;
  nickname?: string | null;
  birthDate?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  notes?: string | null;
}

/** `null` cuando todavía no se ha creado ningún taller. */
export const getActiveCourseRequest = (signal?: AbortSignal) =>
  apiRequest<ICourseDetailResource | null>("/courses/active", { signal });

export const createCourseRequest = (payload: ICreateCoursePayload) =>
  apiRequest<ICourseDetailResource>("/courses", { method: "POST", body: payload });

export const listEnrollmentsRequest = (courseId: string, signal?: AbortSignal) =>
  apiRequest<IEnrollmentResource[]>(`/courses/${courseId}/enrollments`, { signal });

export const enrollNewStudentRequest = (
  courseId: string,
  student: ICreateStudentPayload,
  houseId: string | null,
) =>
  apiRequest<IEnrollmentResource>(`/courses/${courseId}/enrollments`, {
    method: "POST",
    body: { student, houseId },
  });

export const updateEnrollmentRequest = (
  enrollmentId: string,
  payload: { houseId?: string | null },
) =>
  apiRequest<IEnrollmentResource>(`/enrollments/${enrollmentId}`, {
    method: "PATCH",
    body: payload,
  });
