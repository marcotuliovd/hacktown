import { findMapVenueByName, normalizeVenueName } from "@/data/map-venues";
import type { OnboardingEvent } from "@/types/onboarding";

const ROUTE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface AgendaRoutePoint {
  label: string;
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  venueName: string | null;
  x: number | null;
  y: number | null;
  xn: number | null;
  yn: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface AgendaWalkLeg {
  fromLabel: string;
  toLabel: string;
  fromName: string | null;
  toName: string | null;
  sameVenue: boolean;
}

export interface AgendaRoute {
  points: AgendaRoutePoint[];
  legs: AgendaWalkLeg[];
}

export function routeLabel(index: number): string {
  return ROUTE_LABELS[index] ?? String(index + 1);
}

export function resolveRoutePoint(
  event: OnboardingEvent,
  index: number,
): AgendaRoutePoint {
  const mapVenue = event.venueName
    ? findMapVenueByName(event.venueName)
    : undefined;

  return {
    label: routeLabel(index),
    eventId: event.id,
    title: event.title,
    startTime: event.start_time,
    endTime: event.end_time,
    venueName: event.venueName,
    x: mapVenue?.x ?? null,
    y: mapVenue?.y ?? null,
    xn: mapVenue?.xn ?? null,
    yn: mapVenue?.yn ?? null,
    latitude: event.latitude ?? mapVenue?.lat ?? null,
    longitude: event.longitude ?? mapVenue?.lng ?? null,
  };
}

function isSameVenue(from: AgendaRoutePoint, to: AgendaRoutePoint): boolean {
  if (!from.venueName || !to.venueName) return false;
  return (
    normalizeVenueName(from.venueName) === normalizeVenueName(to.venueName)
  );
}

export function buildWalkLeg(
  from: AgendaRoutePoint,
  to: AgendaRoutePoint,
): AgendaWalkLeg {
  return {
    fromLabel: from.label,
    toLabel: to.label,
    fromName: from.venueName,
    toName: to.venueName,
    sameVenue: isSameVenue(from, to),
  };
}

export function buildAgendaRoute(events: OnboardingEvent[]): AgendaRoute {
  const points = events.map((event, index) => resolveRoutePoint(event, index));
  const legs: AgendaWalkLeg[] = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    legs.push(buildWalkLeg(points[i], points[i + 1]));
  }

  return { points, legs };
}
