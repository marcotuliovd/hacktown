"use client";

import { Button } from "@/components/ui/Button";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-sans text-xs uppercase tracking-button text-neon-magenta">
        Falha ao carregar
      </p>
      <h1 className="font-display text-4xl text-text-primary">
        Não foi possível montar o onboarding
      </h1>
      <p className="max-w-md font-sans text-sm text-text-secondary">
        {error.message}
      </p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  );
}
