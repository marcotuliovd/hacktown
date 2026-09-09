"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgendaOptionCard } from "@/components/onboarding/AgendaOptionCard";
import { AgendaSelected } from "@/components/onboarding/AgendaSelected";
import { cn } from "@/lib/cn";
import { eventsFromIds } from "@/lib/onboarding";
import { buildAgendaRoute } from "@/lib/walking";
import { useOnboardingStore } from "@/store/onboarding-store";
import type {
  AgendaOptionIndex,
  OnboardingEvent,
  SelectedAgenda,
} from "@/types/onboarding";

interface AgendaCompareProps {
  events: OnboardingEvent[];
}

export function AgendaCompare({ events }: AgendaCompareProps) {
  const router = useRouter();
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const agendaOptions = useOnboardingStore((state) => state.agendaOptions);
  const selectAgenda = useOnboardingStore((state) => state.selectAgenda);
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState<SelectedAgenda | null>(null);
  const slideRefs = useRef<Record<number, HTMLElement | null>>({});

  const filled = useMemo(
    () =>
      agendaOptions.flatMap((draft, index) =>
        draft
          ? [
              {
                option: (index + 1) as AgendaOptionIndex,
                draft,
                events: eventsFromIds(events, draft.eventIds),
              },
            ]
          : [],
      ),
    [agendaOptions, events],
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (filled.length === 0) {
      router.replace("/onboarding/opcao/1");
    }
  }, [hasHydrated, filled.length, router]);

  function handleSelect(option: AgendaOptionIndex, dayIso: string) {
    const draft = agendaOptions[option - 1];
    if (!draft) return;
    selectAgenda(option);
    setChosen({
      option,
      dayIso,
      eventIds: [...draft.eventIds],
    });
    router.push(`/minha-agenda/${dayIso}`);
  }

  function goToSlide(index: number) {
    const slide = slideRefs.current[index];
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    slide?.scrollIntoView?.({
      inline: "start",
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
    setActive(index);
  }

  if (!hasHydrated || filled.length === 0) {
    return (
      <p className="px-4 py-12 font-sans text-sm text-text-secondary">
        Carregando o comparativo…
      </p>
    );
  }

  if (chosen) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-6">
        <AgendaSelected
          option={chosen.option}
          pickCount={chosen.eventIds.length}
          dayIso={chosen.dayIso}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl pt-6">
      <div className="px-4">
        <p className="font-sans text-xs uppercase tracking-button text-neon-green">
          Passo C · Comparativo
        </p>
        <h1 className="mb-2 font-display text-4xl leading-none text-text-primary sm:text-5xl">
          Escolha a agenda do dia
        </h1>
        <p className="mb-6 font-sans text-sm text-text-secondary">
          {filled.length > 1
            ? "Deslize entre as opções. O mapa mostra a sequência dos locais no festival."
            : "Revise a opção montada e o mapa sequencial dos locais."}
        </p>
      </div>

      <div
        className="-mx-0 flex snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const scroller = event.currentTarget;
          const index = Math.round(
            scroller.scrollLeft / Math.max(scroller.clientWidth, 1),
          );
          if (index !== active) setActive(index);
        }}
      >
        {filled.map((item, index) => (
          <section
            key={item.option}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            className="w-full shrink-0 snap-start px-4"
            aria-label={`Opção ${item.option}`}
          >
            <AgendaOptionCard
              option={item.option}
              dayIso={item.draft.dayIso}
              route={buildAgendaRoute(item.events)}
              onSelect={() => handleSelect(item.option, item.draft.dayIso)}
            />
          </section>
        ))}
      </div>

      {filled.length > 1 ? (
        <div className="mt-2 flex justify-center gap-2 px-4">
          {filled.map((item, index) => (
            <button
              key={item.option}
              type="button"
              aria-label={`Ver opção ${item.option}`}
              aria-current={index === active ? "true" : undefined}
              className={cn(
                "h-2 w-2 rounded-none",
                index === active ? "bg-neon-green" : "bg-bg-surface",
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
