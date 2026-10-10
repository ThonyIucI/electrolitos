import { apiRequest } from "@/lib/api";

/**
 * `needs-setup`: el código todavía no tiene PIN, se entra con el propio código.
 * `needs-pin`: todo lo demás, incluido un código que no existe. Ver `routes/access.ts`.
 */
export type TAccessStatus = "needs-setup" | "needs-pin";

export interface IAccessStatusResult {
  status: TAccessStatus;
}

export const getAccessStatusRequest = (accessCode: string, signal?: AbortSignal) =>
  apiRequest<IAccessStatusResult>(`/access/status?codigo=${encodeURIComponent(accessCode)}`, {
    signal,
  });
