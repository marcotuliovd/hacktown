import { OnboardingHydration } from "@/components/onboarding/OnboardingHydration";
import { SiteHeader } from "@/components/schedule/SiteHeader";
import type { ReactNode } from "react";

export default function MapaLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingHydration>
      <div className="flex h-dvh flex-col overflow-hidden">
        <SiteHeader />
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </OnboardingHydration>
  );
}
