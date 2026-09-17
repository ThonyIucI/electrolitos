import type { ComponentType } from "react";

import { type TLandingTab, tabButtonId, tabPanelId } from "../constants/landing-tabs";
import AudienceSection from "./audience-section";
import BenefitsSection from "./benefits-section";
import CampusesSection from "./campuses-section";
import IntroSection from "./intro-section";
import InvestmentSection from "./investment-section";
import MethodologySection from "./methodology-section";
import MotivationSection from "./motivation-section";
import ObjectivesSection from "./objectives-section";
import SyllabusSection from "./syllabus-section";
import TeacherSection from "./teacher-section";

interface ILandingPanelProps {
  tab: TLandingTab;
}

const PANELS: Record<TLandingTab, ComponentType> = {
  taller: IntroSection,
  motivacion: MotivationSection,
  objetivos: ObjectivesSection,
  "para-quien": AudienceSection,
  metodologia: MethodologySection,
  beneficios: BenefitsSection,
  temario: SyllabusSection,
  docente: TeacherSection,
  sedes: CampusesSection,
  inversion: InvestmentSection,
};

/**
 * Solo se monta la pestaña activa. Al cambiar de pestaña se remonta, y con ello las
 * entradas del `Reveal` vuelven a dispararse: cada sección se siente recién abierta.
 */
export default function LandingPanel({ tab }: ILandingPanelProps) {
  const Section = PANELS[tab];

  return (
    <div
      key={tab}
      role="tabpanel"
      id={tabPanelId(tab)}
      aria-labelledby={tabButtonId(tab)}
      tabIndex={-1}
    >
      <Section />
    </div>
  );
}
