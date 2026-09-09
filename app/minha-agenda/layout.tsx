import { OnboardingHydration } from "@/components/onboarding/OnboardingHydration";
import { SiteHeader } from "@/components/schedule/SiteHeader";
import type { ReactNode } from "react";

export default function MinhaAgendaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OnboardingHydration>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </div>
    </OnboardingHydration>
  );
}
