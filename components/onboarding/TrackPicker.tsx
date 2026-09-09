"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { TrackOption } from "@/types/onboarding";

interface TrackPickerProps {
  tracks: TrackOption[];
}

export function TrackPicker({ tracks }: TrackPickerProps) {
  const router = useRouter();
  const selected = useOnboardingStore((state) => state.favoriteTrackIds);
  const toggleTrack = useOnboardingStore((state) => state.toggleTrack);
  const canContinue = selected.length > 0;

  if (tracks.length === 0) {
    return (
      <p className="py-12 font-sans text-sm text-text-secondary">
        Nenhuma trilha encontrada na programação.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tracks.map((track) => {
          const active = selected.includes(track.id);
          return (
            <button
              key={track.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleTrack(track.id)}
              className={cn(
                "rounded-none border px-3 py-2 text-left font-sans text-sm uppercase tracking-button transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green",
                active
                  ? "border-neon-green bg-neon-green text-black"
                  : "border-subtle text-text-secondary hover:border-neon-green hover:text-neon-green",
              )}
            >
              {track.name}
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none h-24" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 px-4">
        <div className="mx-auto max-w-3xl">
          <Button
            className="w-full"
            disabled={!canContinue}
            onClick={() => router.push("/onboarding/opcao/1")}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
