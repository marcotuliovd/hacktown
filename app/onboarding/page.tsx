import { TrackPicker } from "@/components/onboarding/TrackPicker";
import { extractUniqueTracks } from "@/lib/onboarding";
import { getEvents } from "@/services/api";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suas trilhas — HackTown",
  description:
    "Escolha as trilhas favoritas e monte sua agenda do HackTown 2026.",
};

export default async function OnboardingPage() {
  const events = await getEvents();
  const tracks = extractUniqueTracks(events);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-6">
      <p className="font-sans text-xs uppercase tracking-button text-neon-green">
        Passo A
      </p>
      <h1 className="mb-2 font-display text-4xl leading-none text-text-primary sm:text-5xl">
        Suas trilhas
      </h1>
      <p className="mb-6 max-w-xl font-sans text-sm text-text-secondary">
        Selecione uma ou mais trilhas. A programação da agenda será filtrada
        por elas, horário a horário.
      </p>
      <TrackPicker tracks={tracks} />
    </main>
  );
}
