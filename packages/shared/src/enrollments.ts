export enum EEnrollmentStatus {
  ACTIVE = "ACTIVE",
  DROPPED = "DROPPED",
}

export type TEnrollmentStatus = `${EEnrollmentStatus}`;

export const enrollmentStatusLabels: Record<TEnrollmentStatus, string> = {
  [EEnrollmentStatus.ACTIVE]: "Inscrito",
  [EEnrollmentStatus.DROPPED]: "Retirado",
};

export enum EAttendanceStatus {
  PRESENT = "PRESENT",
  LATE = "LATE",
  ABSENT = "ABSENT",
  EXCUSED = "EXCUSED",
}

export type TAttendanceStatus = `${EAttendanceStatus}`;

export const attendanceStatusLabels: Record<TAttendanceStatus, string> = {
  [EAttendanceStatus.PRESENT]: "Presente",
  [EAttendanceStatus.LATE]: "Tarde",
  [EAttendanceStatus.ABSENT]: "Faltó",
  [EAttendanceStatus.EXCUSED]: "Justificado",
};
