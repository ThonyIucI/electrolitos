export enum ECourseStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

export type TCourseStatus = `${ECourseStatus}`;

export const courseStatusLabels: Record<TCourseStatus, string> = {
  [ECourseStatus.DRAFT]: "Borrador",
  [ECourseStatus.ACTIVE]: "En curso",
  [ECourseStatus.FINISHED]: "Terminado",
};

export enum ESessionStatus {
  PLANNED = "PLANNED",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export type TSessionStatus = `${ESessionStatus}`;

export const sessionStatusLabels: Record<TSessionStatus, string> = {
  [ESessionStatus.PLANNED]: "Planificada",
  [ESessionStatus.OPEN]: "En clase",
  [ESessionStatus.CLOSED]: "Cerrada",
};
