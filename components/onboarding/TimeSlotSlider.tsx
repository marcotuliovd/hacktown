"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { OnboardingEventItem } from "@/components/onboarding/OnboardingEventItem";
import type { OnboardingTimeGroup, SlotDecisions } from "@/types/onboarding";

interface TimeSlotSliderProps {
  groups: OnboardingTimeGroup[];
  decisions: SlotDecisions;
  currentSlotTime: string | null;
  onPick: (slotTime: string, eventId: string) => void;
  onSkip: (slotTime: string) => void;
}

export function TimeSlotSlider({
  groups,
  decisions,
  currentSlotTime,
  onPick,
  onSkip,
}: TimeSlotSliderProps) {
  const slideRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!currentSlotTime) return;
    const slide = slideRefs.current[currentSlotTime];
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    slide?.scrollIntoView?.({
      inline: "start",
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [currentSlotTime]);

  return (
    <div className="-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {groups.map((group) => {
        const decision = decisions[group.time];
        const isCurrent = group.time === currentSlotTime;
        return (
          <section
            key={group.time}
            ref={(node) => {
              slideRefs.current[group.time] = node;
            }}
            className="w-full shrink-0 snap-start px-4 pb-8"
            aria-label={`Horário ${group.time}`}
          >
            <p className="font-sans text-xs uppercase tracking-button text-neon-green">
              {isCurrent ? "Agora" : "Horário"}
            </p>
            <h2 className="mb-4 font-display text-4xl leading-none text-text-primary">
              Às {group.time}
            </h2>
            <div className="flex flex-col gap-3">
              {group.events.map((event) => (
                <OnboardingEventItem
                  key={event.id}
                  event={event}
                  selected={
                    decision?.kind === "pick" && decision.eventId === event.id
                  }
                  onChoose={() => onPick(group.time, event.id)}
                />
              ))}
            </div>
            {isCurrent ? (
              <Button
                variant="magenta"
                className="mt-4 w-full"
                onClick={() => onSkip(group.time)}
              >
                Pular horário
              </Button>
            ) : decision?.kind === "skip" ? (
              <p className="mt-3 font-sans text-xs uppercase tracking-button text-text-secondary">
                Horário pulado
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
