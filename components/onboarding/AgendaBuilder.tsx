"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgendaComplete } from "@/components/onboarding/AgendaComplete";
import { TimeSlotSlider } from "@/components/onboarding/TimeSlotSlider";
import { DayTabs } from "@/components/schedule/DayTabs";
import {
  applySlotDecision,
  completeDecisionsWithSkips,
  currentSlotTime,
  decisionsFromEventIds,
  filterEventsByTracks,
  groupOnboardingEvents,
  hasAtLeastOnePick,
  isAgendaComplete,
  pickedEventIds,
  visibleGroups,
} from "@/lib/onboarding";
import { FESTIVAL_DAYS } from "@/lib/schedule";
import { useOnboardingStore } from "@/store/onboarding-store";
import type {
  AgendaOptionIndex,
  OnboardingEvent,
  SlotDecisions,
} from "@/types/onboarding";

interface AgendaBuilderProps {
  option: AgendaOptionIndex;
  dayIso: string;
  events: OnboardingEvent[];
}

function buildInitialDecisions(
  groups: ReturnType<typeof groupOnboardingEvents>,
  savedIds: string[] | null,
): SlotDecisions {
  if (!savedIds || savedIds.length === 0) return {};
  return completeDecisionsWithSkips(
    groups,
    decisionsFromEventIds(groups, savedIds),
  );
}

export function AgendaBuilder({ option, dayIso, events }: AgendaBuilderProps) {
  const router = useRouter();
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const favoriteTrackIds = useOnboardingStore(
    (state) => state.favoriteTrackIds,
  );
  const agendaOptions = useOnboardingStore((state) => state.agendaOptions);
  const saveAgendaOption = useOnboardingStore(
    (state) => state.saveAgendaOption,
  );

  const groups = useMemo(
    () =>
      groupOnboardingEvents(filterEventsByTracks(events, favoriteTrackIds)),
    [events, favoriteTrackIds],
  );

  const saved = agendaOptions[option - 1];
  const savedIds =
    saved && saved.dayIso === dayIso ? saved.eventIds : null;

  const [decisions, setDecisions] = useState<SlotDecisions>({});
  const [ready, setReady] = useState(false);
  const bootKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (favoriteTrackIds.length === 0) {
      router.replace("/onboarding");
      return;
    }
    if (option > 1 && agendaOptions[option - 2] == null) {
      router.replace(`/onboarding/opcao/${option - 1}`);
      return;
    }

    const key = `${option}:${dayIso}:${favoriteTrackIds.join(",")}`;
    if (bootKeyRef.current === key) return;
    bootKeyRef.current = key;
    setDecisions(buildInitialDecisions(groups, savedIds));
    setReady(true);
  }, [
    hasHydrated,
    favoriteTrackIds,
    option,
    dayIso,
    groups,
    savedIds,
    router,
    agendaOptions,
  ]);

  const current = currentSlotTime(groups, decisions);
  const slides = visibleGroups(groups, decisions);
  const complete = isAgendaComplete(groups, decisions);
  const pickCount = pickedEventIds(groups, decisions).length;
  const selectedMeta = FESTIVAL_DAYS.find((day) => day.iso === dayIso);

  function persistAndGo(href: string) {
    saveAgendaOption(option, {
      dayIso,
      eventIds: pickedEventIds(groups, decisions),
    });
    router.push(href);
  }

  if (!hasHydrated || !ready) {
    return (
      <p className="px-4 py-12 font-sans text-sm text-text-secondary">
        Carregando sua agenda…
      </p>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-6">
      <p className="font-sans text-xs uppercase tracking-button text-neon-green">
        Passo B · Opção {option}
      </p>
      <h1 className="mb-6 font-display text-4xl leading-none text-text-primary sm:text-5xl">
        {selectedMeta
          ? `Agenda ${selectedMeta.day} ${selectedMeta.weekday}`
          : `Opção ${option}`}
      </h1>

      <div className="sticky top-[45px] z-10 -mx-4 mb-6 bg-bg-base/95 px-4 py-3 backdrop-blur">
        <DayTabs
          selected={dayIso}
          hrefForDay={(iso) => `/onboarding/opcao/${option}?dia=${iso}`}
        />
      </div>

      {groups.length === 0 ? (
        <p className="py-12 font-sans text-sm text-text-secondary">
          Nenhum evento nas trilhas escolhidas neste dia.
        </p>
      ) : (
        <>
          <TimeSlotSlider
            groups={slides}
            decisions={decisions}
            currentSlotTime={current}
            onPick={(slotTime, eventId) =>
              setDecisions((prev) =>
                applySlotDecision(prev, slotTime, {
                  kind: "pick",
                  eventId,
                }),
              )
            }
            onSkip={(slotTime) =>
              setDecisions((prev) =>
                applySlotDecision(prev, slotTime, { kind: "skip" }),
              )
            }
          />

          {complete && hasAtLeastOnePick(decisions) ? (
            <>
              <div className="pointer-events-none h-56" aria-hidden="true" />
              <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 px-4">
                <div className="mx-auto max-w-3xl">
                  <AgendaComplete
                    option={option}
                    pickCount={pickCount}
                    onCreateNext={() =>
                      persistAndGo(`/onboarding/opcao/${option + 1}`)
                    }
                    onFinish={() => persistAndGo("/onboarding/comparar")}
                  />
                </div>
              </div>
            </>
          ) : null}

          {complete && !hasAtLeastOnePick(decisions) ? (
            <p className="mt-6 font-sans text-sm text-text-secondary">
              Escolha pelo menos um evento para salvar esta opção. Volte nos
              horários anteriores para selecionar.
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
