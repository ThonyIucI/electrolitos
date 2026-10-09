import type { TUserRole } from "@electrolitos/shared/roles";

import { apiRequest } from "@/lib/api";

export interface IMeResource {
  id: string;
  name: string;
  role: TUserRole;
  email: string | null;
  /** Null para alumnos: su username es el código de la tarjeta. */
  username: string | null;
  /** True mientras el alumno siga entrando con el código y no haya elegido PIN. */
  mustSetPin: boolean;
}

export const getMeRequest = (signal?: AbortSignal) => apiRequest<IMeResource>("/me", { signal });

export interface ISetStudentPinPayload {
  /** El código de la tarjeta la primera vez; el PIN actual si lo está cambiando. */
  currentCredential: string;
  pin: string;
}

export interface ISetStudentPinResult {
  mustSetPin: boolean;
}

export const setStudentPinRequest = (payload: ISetStudentPinPayload) =>
  apiRequest<ISetStudentPinResult>("/me/pin", { method: "POST", body: payload });
