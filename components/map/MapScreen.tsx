"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AgendaPlacesList } from "@/components/map/AgendaPlacesList";
import { FestivalMap } from "@/components/map/FestivalMap";
import {
  buildAgendaPlaces,
  highlightedPinNumbers,
  resolveMapDay,
} from "@/lib/agenda-venues";
import { cn } from "@/lib/cn";
import { eventsByIds, FESTIVAL_DAYS } from "@/lib/schedule";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { HacktownEvent } from "@/types/event";

interface MapScreenProps {
  events: HacktownEvent[];
  initialDay?: string;
}

export function MapScreen({ events, initialDay }: MapScreenProps) {
  const router = useRouter();
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const savedAgendas = useOnboardingStore((state) => state.savedAgendas);
  const [dayIso, setDayIso] = useState<string | null>(initialDay ?? null);
  const [selectedN, setSelectedN] = useState<number | null>(null);

  const savedDays = useMemo(
    () => FESTIVAL_DAYS.filter((day) => savedAgendas[day.iso]),
    [savedAgendas],
  );

  useEffect(() => {
    if (!hasHydrated) return;
    setDayIso((current) =>
      resolveMapDay(
        savedDays.map((day) => day.iso),
        current ?? initialDay,
      ),
    );
  }, [hasHydrated, savedDays, initialDay]);

  const saved = dayIso ? savedAgendas[dayIso] : undefined;
  const picked = saved ? eventsByIds(events, saved.eventIds) : [];
  const stops = saved ? buildAgendaPlaces(picked) : [];
  const highlightedNs = highlightedPinNumbers(stops);
  const selectedDay = FESTIVAL_DAYS.find((day) => day.iso === dayIso);

  function selectDay(iso: string) {
    setDayIso(iso);
    setSelectedN(null);
    router.replace(`/mapa?dia=${iso}`, { scroll: false });
  }

  function selectPlace(n: number | null) {
    setSelectedN(n);
  }

  const dayLabel =
    selectedDay && saved
      ? `${selectedDay.day} ${selectedDay.weekday} · opção ${saved.option}`
      : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <section className="relative min-h-0 flex-[1.15] lg:h-full lg:flex-1">
        <FestivalMap
          selectedN={selectedN}
          highlightedNs={highlightedNs}
          onSelect={selectPlace}
        />
      </section>

      <aside className="flex min-h-[42%] flex-1 flex-col overflow-hidden border-t border-subtle bg-bg-base pb-[env(safe-area-inset-bottom)] lg:h-full lg:min-h-0 lg:w-80 lg:flex-none lg:border-l lg:border-t-0">
        {savedDays.length > 0 ? (
          <nav
            aria-label="Dias com agenda"
            className="flex shrink-0 gap-2 overflow-x-auto border-b border-subtle px-3 py-2.5 sm:px-4 sm:py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {savedDays.map((day) => {
              const isActive = day.iso === dayIso;
              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => selectDay(day.iso)}
                  aria-current={isActive ? "date" : undefined}
                  className={cn(
                    "flex min-h-11 min-w-[3.25rem] shrink-0 flex-col items-center border px-3 py-1.5 font-sans text-[10px] uppercase tracking-button sm:min-w-[3.5rem] sm:py-2 sm:text-xs",
                    isActive
                      ? "border-neon-green bg-neon-green text-black"
                      : "border-subtle text-text-secondary hover:border-neon-green hover:text-neon-green",
                  )}
                >
                  <span className="font-display text-xl leading-none sm:text-2xl">
                    {day.day}
                  </span>
                  <span>{day.weekday}</span>
                </button>
              );
            })}
          </nav>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto">
          <AgendaPlacesList
            stops={stops}
            selectedN={selectedN}
            onSelect={selectPlace}
            hasAgenda={Boolean(saved)}
            hydrated={hasHydrated}
            dayLabel={dayLabel}
          />
        </div>
      </aside>
    </div>
  );
}
