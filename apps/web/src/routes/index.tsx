import { createFileRoute } from "@tanstack/react-router";

import AudienceSection from "@/modules/landing/components/audience-section";
import BenefitsSection from "@/modules/landing/components/benefits-section";
import CampusesSection from "@/modules/landing/components/campuses-section";
import ContactSection from "@/modules/landing/components/contact-section";
import HeroSection from "@/modules/landing/components/hero-section";
import IntroSection from "@/modules/landing/components/intro-section";
import InvestmentSection from "@/modules/landing/components/investment-section";
import MethodologySection from "@/modules/landing/components/methodology-section";
import MotivationSection from "@/modules/landing/components/motivation-section";
import ObjectivesSection from "@/modules/landing/components/objectives-section";
import SyllabusSection from "@/modules/landing/components/syllabus-section";
import TeacherSection from "@/modules/landing/components/teacher-section";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/**
 * Portada pública del taller. Sigue el orden del documento informativo
 * (`docs/informativo-v2.md`) y usa la escala tipográfica `text-landing-*`.
 */
function HomePage() {
  return (
    <main className="text-landing-body">
      <HeroSection />
      <IntroSection />
      <MotivationSection />
      <ObjectivesSection />
      <AudienceSection />
      <MethodologySection />
      <BenefitsSection />
      <SyllabusSection />
      <TeacherSection />
      <CampusesSection />
      <InvestmentSection />
      <ContactSection />
    </main>
  );
}
