import { OnboardingHydration } from "@/components/onboarding/OnboardingHydration";
import { OnboardingProgressBar } from "@/components/onboarding/OnboardingProgressBar";
import { SiteHeader } from "@/components/schedule/SiteHeader";
import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingHydration>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <div className="flex-1 pb-[calc(8rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
        <OnboardingProgressBar />
      </div>
    </OnboardingHydration>
  );
}
