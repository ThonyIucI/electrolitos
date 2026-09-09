/** Rol guardado en `user.role` (better-auth additionalFields). */
export enum EUserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export type TUserRole = `${EUserRole}`;

export const STAFF_ROLES: readonly TUserRole[] = [EUserRole.ADMIN, EUserRole.TEACHER];

export const userRoleLabels: Record<TUserRole, string> = {
  [EUserRole.ADMIN]: "Administrador",
  [EUserRole.TEACHER]: "Profesor",
  [EUserRole.STUDENT]: "Alumno",
};

export const isStaffRole = (role: string): boolean => STAFF_ROLES.includes(role as TUserRole);

/** Normaliza el rol que llega del backend; cae a STUDENT (el menos privilegiado) si no coincide. */
export const parseUserRole = (value: string | null | undefined): TUserRole => {
  const isKnownRole = Object.values(EUserRole).some((role) => role === value);
  return isKnownRole ? (value as TUserRole) : EUserRole.STUDENT;
};
