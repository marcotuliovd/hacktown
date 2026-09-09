"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import {
  eventsByIds,
  FESTIVAL_DAYS,
  formatTimeRange,
} from "@/lib/schedule";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { HacktownEvent } from "@/types/event";

interface AgendaDayDetailProps {
  dayIso: string;
  events: HacktownEvent[];
}

export function AgendaDayDetail({ dayIso, events }: AgendaDayDetailProps) {
  const router = useRouter();
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const saved = useOnboardingStore((state) => state.savedAgendas[dayIso]);
  const favoriteTrackIds = useOnboardingStore((state) => state.favoriteTrackIds);
  const startNewDay = useOnboardingStore((state) => state.startNewDay);
  const prepareEditDay = useOnboardingStore((state) => state.prepareEditDay);
  const deleteSavedAgenda = useOnboardingStore(
    (state) => state.deleteSavedAgenda,
  );

  const day = FESTIVAL_DAYS.find((item) => item.iso === dayIso);
  const picked = saved ? eventsByIds(events, saved.eventIds) : [];
  const label = day ? `${day.day} ${day.weekday}` : dayIso;

  function createForDay() {
    startNewDay(dayIso);
    if (favoriteTrackIds.length === 0) {
      router.push("/onboarding");
      return;
    }
    router.push(`/onboarding/opcao/1?dia=${dayIso}`);
  }

  function editDay() {
    if (!prepareEditDay(dayIso)) return;
    router.push(`/onboarding/opcao/1?dia=${dayIso}`);
  }

  function deleteDay() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Excluir a agenda de ${label}?`)
    ) {
      return;
    }
    deleteSavedAgenda(dayIso);
    router.push("/minha-agenda");
  }

  if (!hasHydrated) {
    return (
      <p className="px-4 py-12 font-sans text-sm text-text-secondary">
        Carregando a agenda do dia…
      </p>
    );
  }

  if (!saved) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
        <Link
          href="/minha-agenda"
          className="font-sans text-xs uppercase tracking-button text-neon-green"
        >
          ← Minha agenda
        </Link>
        <p className="mt-4 font-sans text-xs uppercase tracking-button text-neon-magenta">
          Sem agenda
        </p>
        <h1 className="mt-2 font-display text-4xl leading-none text-text-primary">
          {label}
        </h1>
        <p className="mt-3 font-sans text-sm text-text-secondary">
          Você ainda não selecionou uma agenda para este dia.
        </p>
        <Button onClick={createForDay} className="mt-6 w-full">
          Criar agenda
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <Link
        href="/minha-agenda"
        className="font-sans text-xs uppercase tracking-button text-neon-green"
      >
        ← Minha agenda
      </Link>
      <p className="mt-4 font-sans text-xs uppercase tracking-button text-neon-green">
        Agenda do dia · opção {saved.option}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-none text-text-primary sm:text-5xl">
        {label}
      </h1>
      <p className="mt-2 mb-6 font-sans text-sm text-text-secondary">
        {picked.length} {picked.length === 1 ? "atividade" : "atividades"} ·
        adicione cada uma ao Google Calendar.
      </p>

      {picked.length === 0 ? (
        <p className="font-sans text-sm text-text-secondary">
          Os eventos desta agenda não estão mais na programação.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {picked.map((event) => {
            const calendarUrl = buildGoogleCalendarUrl(event);
            const time = formatTimeRange(event.start_time, event.end_time);
            return (
              <li
                key={event.id}
                className="flex flex-col gap-3 border border-subtle bg-bg-surface p-4"
              >
                <p className="font-sans text-xs tabular-nums text-neon-green">
                  {time}
                </p>
                <h2 className="font-display text-2xl leading-none text-text-primary">
                  {event.title}
                </h2>
                {event.venue?.name ? (
                  <p className="font-sans text-sm text-text-secondary">
                    {event.venue.name}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row">
                  {calendarUrl ? (
                    <Button href={calendarUrl} className="w-full sm:flex-1">
                      Adicionar ao Google Calendar
                    </Button>
                  ) : null}
                  <Button
                    href={`/programacao/${event.id}`}
                    variant="cyan"
                    className="w-full sm:flex-1"
                  >
                    Ver evento
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button href={`/mapa?dia=${dayIso}`} variant="cyan" className="w-full">
          Ver no mapa
        </Button>
        <Button variant="cyan" onClick={editDay} className="w-full">
          Editar agenda
        </Button>
        <Button variant="magenta" onClick={deleteDay} className="w-full">
          Excluir agenda
        </Button>
      </div>
    </main>
  );
}
