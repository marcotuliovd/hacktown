import type { EventListItemData, HacktownEvent } from "@/types/event";

export const FESTIVAL_TIMEZONE = "America/Sao_Paulo";
/** Offset fixo de São Paulo (sem horário de verão). */
export const FESTIVAL_UTC_OFFSET = "-03:00";

export interface FestivalDay {
  iso: string;
  day: string;
  weekday: string;
}

/** HackTown 2026 — 3 a 7 de setembro, em Santa Rita do Sapucaí. */
export const FESTIVAL_DAYS: FestivalDay[] = [
  { iso: "2026-09-03", day: "03", weekday: "qui" },
  { iso: "2026-09-04", day: "04", weekday: "sex" },
  { iso: "2026-09-05", day: "05", weekday: "sáb" },
  { iso: "2026-09-06", day: "06", weekday: "dom" },
  { iso: "2026-09-07", day: "07", weekday: "seg" },
];

const FIRST_DAY = FESTIVAL_DAYS[0].iso;
const LAST_DAY = FESTIVAL_DAYS[FESTIVAL_DAYS.length - 1].iso;

function pad(value: number | string): string {
  return String(value).padStart(2, "0");
}

/** Data civil (YYYY-MM-DD) no fuso do festival. */
export function toFestivalDateIso(
  input: Date | string,
  timeZone: string = FESTIVAL_TIMEZONE,
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Combina `event_date` (YYYY-MM-DD) + `HH:MM[:SS]` como horário de parede
 * em America/Sao_Paulo.
 */
export function combineFestivalDateTime(
  eventDate: string,
  time: string,
): Date | null {
  const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!dateMatch || !timeMatch) return null;

  const iso = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${pad(timeMatch[1])}:${timeMatch[2]}:${pad(timeMatch[3] ?? "00")}${FESTIVAL_UTC_OFFSET}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isFestivalDay(iso: string | undefined | null): iso is string {
  return Boolean(iso && FESTIVAL_DAYS.some((d) => d.iso === iso));
}

/**
 * Dia exibido por padrão: hoje se estiver na janela do festival;
 * senão o primeiro dia (antes) ou o último (depois).
 */
export function getDefaultFestivalDay(
  now: Date = new Date(),
  timeZone: string = FESTIVAL_TIMEZONE,
): string {
  const today = toFestivalDateIso(now, timeZone);
  if (today < FIRST_DAY) return FIRST_DAY;
  if (today > LAST_DAY) return LAST_DAY;
  return today;
}

export function resolveFestivalDay(
  requested: string | undefined | null,
  now: Date = new Date(),
): string {
  if (isFestivalDay(requested)) return requested;
  return getDefaultFestivalDay(now);
}

export function isEventEnded(
  eventDate: string,
  endTime: string,
  now: Date = new Date(),
): boolean {
  const end = combineFestivalDateTime(eventDate, endTime);
  if (!end) return false;
  return end.getTime() < now.getTime();
}

/** Formata `09:00:00` → `09:00`. */
export function formatTime(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (match) return `${pad(match[1])}:${match[2]}`;
  return time;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} — ${formatTime(endTime)}`;
}

export function toListItem(event: HacktownEvent): EventListItemData {
  return {
    id: event.id,
    title: event.title,
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time,
    venueName: event.venue?.name ?? null,
    activityType: event.activity_type,
  };
}

/** Resolve eventos na ordem dos IDs (agenda salva). */
export function eventsByIds(
  events: HacktownEvent[],
  ids: string[],
): HacktownEvent[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  return ids
    .map((id) => byId.get(id))
    .filter((event): event is HacktownEvent => Boolean(event));
}

export function filterEventsByDay(
  events: HacktownEvent[],
  dayIso: string,
): HacktownEvent[] {
  return events
    .filter((event) => event.event_date === dayIso)
    .sort((a, b) => {
      const byTime = a.start_time.localeCompare(b.start_time);
      return byTime !== 0 ? byTime : a.id.localeCompare(b.id);
    });
}

export function groupEventsByStartTime(
  events: EventListItemData[],
): { time: string; events: EventListItemData[] }[] {
  const groups = new Map<string, EventListItemData[]>();
  for (const event of events) {
    const time = formatTime(event.start_time);
    const bucket = groups.get(time);
    if (bucket) {
      bucket.push(event);
    } else {
      groups.set(time, [event]);
    }
  }
  return Array.from(groups.entries()).map(([time, grouped]) => ({
    time,
    events: grouped,
  }));
}

export function getEventImageUrl(event: HacktownEvent): string | undefined {
  if (event.image_url) return event.image_url;
  return getSpeakerCoverUrl(event);
}

/**
 * Capa do EventCard: `event_speakers[0].speakers.photo_url` quando existir.
 */
export function getSpeakerCoverUrl(event: HacktownEvent): string | undefined {
  return event.event_speakers[0]?.speakers?.photo_url ?? undefined;
}

/** Preferência do card: foto do palestrante, senão `image_url` da atividade. */
export function getEventCardCoverUrl(event: HacktownEvent): string | undefined {
  return getSpeakerCoverUrl(event) ?? event.image_url ?? undefined;
}

/**
 * Recorte para vitrine (home). Prefere eventos maiores, com capa e do dia
 * corrente do festival.
 */
export function pickFeaturedEvents(
  events: HacktownEvent[],
  count = 3,
  now: Date = new Date(),
): HacktownEvent[] {
  if (count <= 0 || events.length === 0) return [];

  const day = getDefaultFestivalDay(now);
  return [...events]
    .sort((a, b) => {
      const score = featuredScore(b, day) - featuredScore(a, day);
      if (score !== 0) return score;
      const byDate = a.event_date.localeCompare(b.event_date);
      if (byDate !== 0) return byDate;
      return a.start_time.localeCompare(b.start_time);
    })
    .slice(0, count);
}

function featuredScore(event: HacktownEvent, dayIso: string): number {
  let score = 0;
  if (event.is_evento_maior) score += 8;
  if (getEventCardCoverUrl(event)) score += 4;
  if (event.event_date === dayIso) score += 2;
  return score;
}
