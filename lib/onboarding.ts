import { formatTime } from "@/lib/schedule";
import type { HacktownEvent } from "@/types/event";
import type {
  AgendaOptionIndex,
  OnboardingEvent,
  OnboardingTimeGroup,
  SlotDecision,
  SlotDecisions,
  TrackOption,
} from "@/types/onboarding";

export const ONBOARDING_STEPS = [
  { id: "tracks", label: "Trilhas" },
  { id: "option-1", label: "Opção 1" },
  { id: "option-2", label: "Opção 2" },
  { id: "option-3", label: "Opção 3" },
  { id: "compare", label: "Comparar" },
] as const;

export function parseAgendaOptionIndex(
  value: string | undefined | null,
): AgendaOptionIndex | null {
  if (value === "1" || value === "2" || value === "3") return Number(value) as AgendaOptionIndex;
  return null;
}

export function toOnboardingEvent(event: HacktownEvent): OnboardingEvent {
  const trackIds = event.event_tracks
    .map((link) => link.tracks?.id)
    .filter((id): id is string => Boolean(id));

  return {
    id: event.id,
    title: event.title,
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time,
    venueName: event.venue?.name ?? null,
    latitude: event.venue?.latitude ?? null,
    longitude: event.venue?.longitude ?? null,
    activityType: event.activity_type,
    trackIds,
  };
}

/** Resolve os eventos de um rascunho na ordem em que foram escolhidos. */
export function eventsFromIds(
  events: OnboardingEvent[],
  eventIds: string[],
): OnboardingEvent[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  return eventIds
    .map((id) => byId.get(id))
    .filter((event): event is OnboardingEvent => Boolean(event));
}

export function extractUniqueTracks(events: HacktownEvent[]): TrackOption[] {
  const map = new Map<string, TrackOption>();
  for (const event of events) {
    for (const link of event.event_tracks) {
      const track = link.tracks;
      if (!track?.id || !track.name) continue;
      if (!map.has(track.id)) {
        map.set(track.id, {
          id: track.id,
          name: track.name,
          code: track.code,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
}

export function filterEventsByTracks(
  events: OnboardingEvent[],
  trackIds: string[],
): OnboardingEvent[] {
  if (trackIds.length === 0) return [];
  const selected = new Set(trackIds);
  return events.filter((event) =>
    event.trackIds.some((id) => selected.has(id)),
  );
}

export function groupOnboardingEvents(
  events: OnboardingEvent[],
): OnboardingTimeGroup[] {
  const groups = new Map<string, OnboardingEvent[]>();
  for (const event of events) {
    const time = formatTime(event.start_time);
    const bucket = groups.get(time);
    if (bucket) {
      bucket.push(event);
    } else {
      groups.set(time, [event]);
    }
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, grouped]) => ({ time, events: grouped }));
}

export function rewindDecisions(
  decisions: SlotDecisions,
  fromSlotTime: string,
): SlotDecisions {
  const next: SlotDecisions = {};
  for (const [time, decision] of Object.entries(decisions)) {
    if (time < fromSlotTime) next[time] = decision;
  }
  return next;
}

export function applySlotDecision(
  decisions: SlotDecisions,
  slotTime: string,
  decision: SlotDecision,
): SlotDecisions {
  const next = rewindDecisions(decisions, slotTime);
  next[slotTime] = decision;
  return next;
}

function eventEndTime(
  group: OnboardingTimeGroup,
  eventId: string,
): string {
  const event = group.events.find((item) => item.id === eventId);
  return formatTime(event?.end_time ?? group.time);
}

/**
 * Primeiro horário ainda sem decisão e compatível com o cursor
 * (após o fim do último evento escolhido, ou depois de um skip).
 */
export function currentSlotTime(
  groups: OnboardingTimeGroup[],
  decisions: SlotDecisions,
): string | null {
  let cursor = "00:00";
  let requireAfter = false;

  for (const group of groups) {
    const eligible = requireAfter
      ? group.time > cursor
      : group.time >= cursor;
    if (!eligible) continue;

    const decision = decisions[group.time];
    if (!decision) return group.time;

    if (decision.kind === "pick") {
      cursor = eventEndTime(group, decision.eventId);
      requireAfter = false;
    } else {
      cursor = group.time;
      requireAfter = true;
    }
  }

  return null;
}

export function visibleGroups(
  groups: OnboardingTimeGroup[],
  decisions: SlotDecisions,
): OnboardingTimeGroup[] {
  const current = currentSlotTime(groups, decisions);
  return groups.filter((group) => {
    if (decisions[group.time]) return true;
    return current !== null && group.time === current;
  });
}

export function pickedEventIds(
  groups: OnboardingTimeGroup[],
  decisions: SlotDecisions,
): string[] {
  const ids: string[] = [];
  for (const group of groups) {
    const decision = decisions[group.time];
    if (decision?.kind === "pick") ids.push(decision.eventId);
  }
  return ids;
}

export function isAgendaComplete(
  groups: OnboardingTimeGroup[],
  decisions: SlotDecisions,
): boolean {
  return groups.length > 0 && currentSlotTime(groups, decisions) === null;
}

export function hasAtLeastOnePick(decisions: SlotDecisions): boolean {
  return Object.values(decisions).some((decision) => decision.kind === "pick");
}

/** Reconstrói picks a partir dos IDs salvos (skips não são persistidos). */
export function decisionsFromEventIds(
  groups: OnboardingTimeGroup[],
  eventIds: string[],
): SlotDecisions {
  const remaining = new Set(eventIds);
  const decisions: SlotDecisions = {};
  for (const group of groups) {
    const match = group.events.find((event) => remaining.has(event.id));
    if (!match) continue;
    decisions[group.time] = { kind: "pick", eventId: match.id };
    remaining.delete(match.id);
  }
  return decisions;
}

/**
 * Preenche skips nos horários restantes para uma agenda já salva,
 * de modo que a UI trate o dia como concluído.
 */
export function completeDecisionsWithSkips(
  groups: OnboardingTimeGroup[],
  decisions: SlotDecisions,
): SlotDecisions {
  let next = { ...decisions };
  for (;;) {
    const current = currentSlotTime(groups, next);
    if (!current) break;
    next = applySlotDecision(next, current, { kind: "skip" });
  }
  return next;
}
