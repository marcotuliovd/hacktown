import { combineFestivalDateTime } from "@/lib/schedule";
import type { HacktownEvent } from "@/types/event";

export const HACKTOWN_CITY = "Santa Rita do Sapucaí, MG";
export const HACKTOWN_LOCATION_LABEL = "HackTown";

const GOOGLE_CALENDAR_RENDER =
  "https://calendar.google.com/calendar/render";

/** Stamp UTC no formato do Google Calendar: YYYYMMDDTHHMMSSZ. */
export function toGoogleCalendarStamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function buildCalendarLocation(
  venueName: string | null | undefined,
): string {
  const base = `${HACKTOWN_LOCATION_LABEL}, ${HACKTOWN_CITY}`;
  const name = venueName?.trim();
  return name ? `${name}, ${base}` : base;
}

/**
 * URL de evento único no Google Calendar (action=TEMPLATE).
 * `location` usa venue.name + HackTown em Santa Rita do Sapucaí.
 */
export function buildGoogleCalendarUrl(event: HacktownEvent): string | null {
  const start = combineFestivalDateTime(event.event_date, event.start_time);
  const end = combineFestivalDateTime(event.event_date, event.end_time);
  if (!start || !end) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGoogleCalendarStamp(start)}/${toGoogleCalendarStamp(end)}`,
    details: event.description ?? "",
    location: buildCalendarLocation(event.venue?.name),
  });

  return `${GOOGLE_CALENDAR_RENDER}?${params.toString()}`;
}
