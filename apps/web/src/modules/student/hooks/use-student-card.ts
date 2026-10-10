import type { IStudentCardResource } from "@electrolitos/shared/resources";

import { useRequest } from "@/common/hooks/use-request";
import { getStudentCardRequest } from "@/modules/student/services/student.service";

export const useStudentCard = () => {
  const request = useRequest<IStudentCardResource>();

  const handler = (signal?: AbortSignal) => request.handleRequest(() => getStudentCardRequest(signal));

  return { card: request.data, loading: request.loading, handler };
};
