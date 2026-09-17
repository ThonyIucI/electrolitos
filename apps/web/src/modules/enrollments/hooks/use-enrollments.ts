import type { IEnrollmentResource } from "@electrolitos/shared/resources";
import { toast } from "sonner";

import { useRequest } from "@/common/hooks/use-request";
import {
  enrollNewStudentRequest,
  listEnrollmentsRequest,
  updateEnrollmentRequest,
  type ICreateStudentPayload,
} from "@/modules/enrollments/services/enrollment.service";

const upsert = (list: IEnrollmentResource[], item: IEnrollmentResource): IEnrollmentResource[] => {
  const exists = list.some((entry) => entry.id === item.id);
  const next = exists ? list.map((entry) => (entry.id === item.id ? item : entry)) : [...list, item];

  return [...next].sort((a, b) =>
    `${a.student.lastName} ${a.student.firstName}`.localeCompare(
      `${b.student.lastName} ${b.student.firstName}`,
      "es",
    ),
  );
};

export const useEnrollments = () => {
  const request = useRequest<IEnrollmentResource[]>();

  const handler = (courseId: string, signal?: AbortSignal) =>
    request.handleRequest(() => listEnrollmentsRequest(courseId, signal));

  const enroll = async (
    courseId: string,
    student: ICreateStudentPayload,
    houseId: string | null,
  ) => {
    try {
      const created = await enrollNewStudentRequest(courseId, student, houseId);
      request.setData((previous) => upsert(previous ?? [], created));
      toast.success(`${created.student.firstName} quedó inscrito`);
      return created;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo inscribir al alumno.");
      return null;
    }
  };

  const assignHouse = async (enrollmentId: string, houseId: string | null) => {
    try {
      const updated = await updateEnrollmentRequest(enrollmentId, { houseId });
      request.setData((previous) => upsert(previous ?? [], updated));
      return updated;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar la casa.");
      return null;
    }
  };

  return {
    enrollments: request.data ?? [],
    loading: request.loading,
    handler,
    enroll,
    assignHouse,
  };
};
