import type { ICourseDetailResource } from "@electrolitos/shared/resources";
import { toast } from "sonner";

import { useRequest } from "@/common/hooks/use-request";
import {
  createCourseRequest,
  getActiveCourseRequest,
  type ICreateCoursePayload,
} from "@/modules/enrollments/services/enrollment.service";

export const useActiveCourse = () => {
  const request = useRequest<ICourseDetailResource | null>();

  const handler = (signal?: AbortSignal) =>
    request.handleRequest(() => getActiveCourseRequest(signal));

  const create = async (payload: ICreateCoursePayload) => {
    const created = await request.handleRequest(() => createCourseRequest(payload));
    if (created) {
      toast.success("Taller creado con sus cuatro casas");
    }
    return created;
  };

  return { course: request.data, loading: request.loading, handler, create };
};
