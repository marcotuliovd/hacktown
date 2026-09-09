"use client";

import { useEffect, type ReactNode } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";

function markHydrated() {
  useOnboardingStore.getState().setHasHydrated(true);
}

/**
 * Rehidrata o persist do Zustand só no client (evita mismatch de SSR).
 */
export function OnboardingHydration({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsub = useOnboardingStore.persist.onFinishHydration(markHydrated);
    void useOnboardingStore.persist.rehydrate();
    if (useOnboardingStore.persist.hasHydrated()) {
      markHydrated();
    }
    return unsub;
  }, []);

  return children;
}
