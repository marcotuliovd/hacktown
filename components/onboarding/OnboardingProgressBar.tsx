"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

export function stepIndexFromPath(pathname: string): number {
  if (pathname.includes("/onboarding/comparar")) return 4;
  const match = pathname.match(/\/onboarding\/opcao\/([123])/);
  if (match) return Number(match[1]);
  return 0;
}

export function OnboardingProgressBar() {
  const pathname = usePathname();
  const current = stepIndexFromPath(pathname);
  const agendaOptions = useOnboardingStore((state) => state.agendaOptions);
  const selectedAgenda = useOnboardingStore((state) => state.selectedAgenda);
  const percent = ((current + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-20 border-t border-subtle bg-bg-base/95 px-4 pt-3 backdrop-blur"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-3xl">
        <div
          className="mb-2 h-1 w-full bg-bg-surface"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={ONBOARDING_STEPS.length}
          aria-valuenow={current + 1}
          aria-label="Progresso do onboarding"
        >
          <div
            className="h-full bg-neon-green transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <ol className="flex justify-between gap-1">
          {ONBOARDING_STEPS.map((step, index) => {
            const done =
              index === 0
                ? current > 0
                : index <= 3
                  ? agendaOptions[index - 1] != null || current > index
                  : selectedAgenda != null || current > index;
            const active = index === current;
            return (
              <li
                key={step.id}
                className={cn(
                  "font-sans text-[10px] uppercase tracking-button sm:text-xs",
                  active
                    ? "text-neon-green"
                    : done
                      ? "text-text-primary"
                      : "text-text-secondary",
                )}
              >
                {step.label}
              </li>
            );
          })}
        </ol>
      </div>
    </footer>
  );
}
