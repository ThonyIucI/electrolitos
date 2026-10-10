import type { ICourseDetailResource } from "@electrolitos/shared/resources";
import { toast } from "sonner";

import { useRequest } from "@/common/hooks/use-request";
import {
  type ICreateCoursePayload,
  type TUpdateCoursePayload,
  createCourseRequest,
  listCoursesRequest,
  updateCourseRequest,
} from "@/modules/enrollments/services/enrollment.service";

const upsert = (
  list: ICourseDetailResource[],
  item: ICourseDetailResource,
): ICourseDetailResource[] =>
  list.some((entry) => entry.id === item.id)
    ? list.map((entry) => (entry.id === item.id ? item : entry))
    : [item, ...list];

/**
 * Las cohortes del taller. Son varias a la vez desde que hay dos sedes, así que el panel
 * trabaja con la lista y el usuario elige con cuál está trabajando.
 */
export const useCourses = () => {
  const request = useRequest<ICourseDetailResource[]>();

  const handler = (signal?: AbortSignal) =>
    request.handleRequest(() => listCoursesRequest(signal));

  const create = async (payload: ICreateCoursePayload) => {
    try {
      const created = await createCourseRequest(payload);
      request.setData((previous) => upsert(previous ?? [], created));
      toast.success(`«${created.name}» creado con sus cuatro casas`);
      return created;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el taller.");
      return null;
    }
  };

  const update = async (courseId: string, payload: TUpdateCoursePayload) => {
    try {
      const updated = await updateCourseRequest(courseId, payload);
      request.setData((previous) => upsert(previous ?? [], updated));
      toast.success("Taller actualizado");
      return updated;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el taller.");
      return null;
    }
  };

  return { courses: request.data ?? [], loading: request.loading, handler, create, update };
};
