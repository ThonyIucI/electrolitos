import { toast } from "sonner";

import { useRequest } from "@/common/hooks/use-request";
import {
  type ISetStudentPinPayload,
  type ISetStudentPinResult,
  setStudentPinRequest,
} from "@/modules/student/services/student.service";

export const useSetStudentPin = () => {
  const request = useRequest<ISetStudentPinResult>();

  const handler = async (payload: ISetStudentPinPayload) => {
    const result = await request.handleRequest(() => setStudentPinRequest(payload));

    if (result) {
      toast.success("¡Listo! Ya tienes tu PIN.");
    }
    return result;
  };

  return { loading: request.loading, handler };
};
