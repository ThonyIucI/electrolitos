import type { IStudentCardResource } from "@electrolitos/shared/resources";
import type { TUserRole } from "@electrolitos/shared/roles";

import { apiRequest } from "@/lib/api";

export interface IMeResource {
  id: string;
  name: string;
  role: TUserRole;
  email: string | null;
  /** Null para alumnos: su username es su código de inscripción. */
  username: string | null;
  /** True mientras el alumno siga entrando con el código y no haya elegido PIN. */
  mustSetPin: boolean;
}

export const getMeRequest = (signal?: AbortSignal) => apiRequest<IMeResource>("/me", { signal });

export interface ISetStudentPinPayload {
  pin: string;
  /** Solo al cambiarlo. Crear el primero no pide nada más que el PIN nuevo. */
  currentPin?: string;
}

export interface ISetStudentPinResult {
  mustSetPin: boolean;
}

export const setStudentPinRequest = (payload: ISetStudentPinPayload) =>
  apiRequest<ISetStudentPinResult>("/me/pin", { method: "POST", body: payload });

export const getStudentCardRequest = (signal?: AbortSignal) =>
  apiRequest<IStudentCardResource>("/me/card", { signal });
