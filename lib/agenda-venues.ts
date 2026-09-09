import {
  findMapVenueByName,
  normalizeVenueName,
} from "@/data/map-venues";
import {
  FESTIVAL_DAYS,
  formatTimeRange,
  getDefaultFestivalDay,
  isFestivalDay,
  toFestivalDateIso,
} from "@/lib/schedule";
import type { HacktownEvent } from "@/types/event";

export interface AgendaPlaceEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface AgendaPlaceStop {
  key: string;
  n: number | null;
  name: string;
  x: number | null;
  y: number | null;
  events: AgendaPlaceEvent[];
}

/**
 * Locais únicos da agenda, na ordem de visita (primeira ocorrência).
 * Casa o nome do venue com o pin numerado do mapa antigo.
 */
export function buildAgendaPlaces(events: HacktownEvent[]): AgendaPlaceStop[] {
  const stops: AgendaPlaceStop[] = [];
  const indexByKey = new Map<string, number>();

  for (const event of events) {
    const venueName = event.venue?.name?.trim() || null;
    const mapVenue = venueName ? findMapVenueByName(venueName) : undefined;
    const key = mapVenue
      ? `pin:${mapVenue.n}`
      : venueName
        ? `name:${normalizeVenueName(venueName)}`
        : `event:${event.id}`;

    const item: AgendaPlaceEvent = {
      id: event.id,
      title: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
    };

    const existing = indexByKey.get(key);
    if (existing != null) {
      stops[existing].events.push(item);
      continue;
    }

    indexByKey.set(key, stops.length);
    stops.push({
      key,
      n: mapVenue?.n ?? null,
      name: mapVenue?.nome ?? venueName ?? "Local a confirmar",
      x: mapVenue?.x ?? null,
      y: mapVenue?.y ?? null,
      events: [item],
    });
  }

  return stops;
}

export function agendaPlaceTimeLabel(stop: AgendaPlaceStop): string {
  const first = stop.events[0];
  const last = stop.events[stop.events.length - 1];
  if (!first || !last) return "";
  return formatTimeRange(first.startTime, last.endTime);
}

export function highlightedPinNumbers(stops: AgendaPlaceStop[]): number[] {
  return stops
    .map((stop) => stop.n)
    .filter((n): n is number => n != null);
}

/**
 * Dia aberto no mapa: query válida com agenda, senão hoje (se houver agenda
 * nesse dia), senão o primeiro dia salvo.
 */
export function resolveMapDay(
  savedDayIsos: string[],
  requested?: string | null,
  now: Date = new Date(),
): string | null {
  const saved = FESTIVAL_DAYS.map((day) => day.iso).filter((iso) =>
    savedDayIsos.includes(iso),
  );

  if (requested && saved.includes(requested)) return requested;
  if (saved.length === 0) {
    return isFestivalDay(requested) ? requested : null;
  }

  const today = toFestivalDateIso(now);
  if (saved.includes(today)) return today;

  const fallback = getDefaultFestivalDay(now);
  if (saved.includes(fallback)) return fallback;

  return saved[0] ?? null;
}
