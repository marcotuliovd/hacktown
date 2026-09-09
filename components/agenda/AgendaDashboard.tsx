"use client";

import { useRouter } from "next/navigation";
import { SavedAgendaCard } from "@/components/agenda/SavedAgendaCard";
import { Button } from "@/components/ui/Button";
import { FESTIVAL_DAYS } from "@/lib/schedule";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { HacktownEvent } from "@/types/event";

interface AgendaDashboardProps {
  events: HacktownEvent[];
}

export function AgendaDashboard({ events }: AgendaDashboardProps) {
  const router = useRouter();
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const savedAgendas = useOnboardingStore((state) => state.savedAgendas);
  const favoriteTrackIds = useOnboardingStore((state) => state.favoriteTrackIds);
  const startNewDay = useOnboardingStore((state) => state.startNewDay);
  const prepareEditDay = useOnboardingStore((state) => state.prepareEditDay);
  const deleteSavedAgenda = useOnboardingStore(
    (state) => state.deleteSavedAgenda,
  );

  const savedCount = FESTIVAL_DAYS.filter((day) => savedAgendas[day.iso]).length;

  function createForDay(dayIso: string) {
    startNewDay(dayIso);
    if (favoriteTrackIds.length === 0) {
      router.push("/onboarding");
      return;
    }
    router.push(`/onboarding/opcao/1?dia=${dayIso}`);
  }

  function editDay(dayIso: string) {
    if (!prepareEditDay(dayIso)) return;
    router.push(`/onboarding/opcao/1?dia=${dayIso}`);
  }

  function deleteDay(dayIso: string, label: string) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Excluir a agenda de ${label}?`)
    ) {
      return;
    }
    deleteSavedAgenda(dayIso);
  }

  if (!hasHydrated) {
    return (
      <p className="px-4 py-12 font-sans text-sm text-text-secondary">
        Carregando suas agendas…
      </p>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <p className="font-sans text-xs uppercase tracking-button text-neon-green">
        Área do participante
      </p>
      <h1 className="mb-2 font-display text-4xl leading-none text-text-primary sm:text-5xl">
        Minha agenda
      </h1>
      <p className="mb-6 font-sans text-sm text-text-secondary">
        {savedCount === 0
          ? "Nenhuma agenda salva ainda. Monte a programação de um dia para começar."
          : `${savedCount} de ${FESTIVAL_DAYS.length} dias com agenda.`}
      </p>

      <ul className="flex flex-col gap-4">
        {FESTIVAL_DAYS.map((day) => {
          const saved = savedAgendas[day.iso];
          const label = `${day.day} ${day.weekday}`;

          if (saved) {
            return (
              <li key={day.iso}>
                <SavedAgendaCard
                  day={day}
                  agenda={saved}
                  events={events}
                  onEdit={() => editDay(day.iso)}
                  onDelete={() => deleteDay(day.iso, label)}
                />
              </li>
            );
          }

          return (
            <li key={day.iso}>
              <article className="flex flex-col gap-3 border border-dashed border-subtle p-4">
                <p className="font-sans text-xs uppercase tracking-button text-text-secondary">
                  {day.weekday} · {day.day}/09
                </p>
                <h2 className="font-display text-2xl leading-none text-text-primary">
                  Sem agenda neste dia
                </h2>
                <Button
                  variant="cyan"
                  onClick={() => createForDay(day.iso)}
                  className="w-full"
                >
                  Criar agenda
                </Button>
              </article>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
