/**
 * La portada no se lee de corrido: cada bloque es una pestaña. El orden es el del
 * documento informativo, para que quien lo tenga impreso encuentre lo mismo.
 */
export const LANDING_TABS = [
  { key: "taller", label: "El taller" },
  { key: "motivacion", label: "Motivación" },
  { key: "objetivos", label: "Objetivos" },
  { key: "para-quien", label: "Para quién" },
  { key: "metodologia", label: "Metodología" },
  { key: "beneficios", label: "Beneficios" },
  { key: "temario", label: "Temario" },
  { key: "docente", label: "Docente" },
  { key: "sedes", label: "Sedes y fechas" },
  { key: "inversion", label: "Inversión" },
] as const;

export type TLandingTab = (typeof LANDING_TABS)[number]["key"];

export const DEFAULT_LANDING_TAB: TLandingTab = "taller";

export const tabPanelId = (tab: TLandingTab) => `panel-${tab}`;
export const tabButtonId = (tab: TLandingTab) => `tab-${tab}`;
