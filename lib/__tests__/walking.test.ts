import { MAP_VENUES } from "@/data/map-venues";
import {
  buildAgendaRoute,
  buildWalkLeg,
  resolveRoutePoint,
} from "@/lib/walking";
import type { OnboardingEvent } from "@/types/onboarding";

const event = (
  overrides: Partial<OnboardingEvent> & Pick<OnboardingEvent, "id">,
): OnboardingEvent => ({
  title: `Evento ${overrides.id}`,
  event_date: "2026-09-05",
  start_time: "09:00:00",
  end_time: "10:00:00",
  venueName: "Palco Petrobras",
  latitude: null,
  longitude: null,
  activityType: "Palestra",
  trackIds: ["track-ia"],
  ...overrides,
});

describe("buildWalkLeg", () => {
  it("marca o mesmo venue", () => {
    const from = resolveRoutePoint(
      event({ id: "a", venueName: "Palco Petrobras" }),
      0,
    );
    const to = resolveRoutePoint(
      event({ id: "b", venueName: "palco petrobras" }),
      1,
    );
    expect(buildWalkLeg(from, to)).toMatchObject({
      fromLabel: "A",
      toLabel: "B",
      sameVenue: true,
    });
  });

  it("não marca venues diferentes", () => {
    const from = resolveRoutePoint(event({ id: "a" }), 0);
    const to = resolveRoutePoint(event({ id: "b", venueName: "Coreto" }), 1);
    expect(buildWalkLeg(from, to).sameVenue).toBe(false);
  });
});

describe("resolveRoutePoint", () => {
  it("usa o pin do mapa quando o venue existe", () => {
    const petrobras = MAP_VENUES.find((v) => v.n === 30);
    expect(petrobras).toBeTruthy();
    const point = resolveRoutePoint(event({ id: "a" }), 0);
    expect(point.label).toBe("A");
    expect(point.x).toBe(petrobras!.x);
    expect(point.y).toBe(petrobras!.y);
    expect(point.xn).toBe(petrobras!.xn);
    expect(point.yn).toBe(petrobras!.yn);
  });

  it("deixa o pin nulo se o local não está no mapa", () => {
    const point = resolveRoutePoint(
      event({ id: "a", venueName: "Lugar Desconhecido" }),
      0,
    );
    expect(point.x).toBeNull();
    expect(point.y).toBeNull();
    expect(point.xn).toBeNull();
    expect(point.yn).toBeNull();
  });
});

describe("buildAgendaRoute", () => {
  it("rotula A→B→C e marca o mesmo local na primeira perna", () => {
    const route = buildAgendaRoute([
      event({ id: "a", venueName: "Palco Petrobras" }),
      event({
        id: "b",
        venueName: "Palco Petrobras",
        start_time: "10:00:00",
      }),
      event({
        id: "c",
        venueName: "Coreto",
        start_time: "11:00:00",
      }),
    ]);

    expect(route.points.map((p) => p.label)).toEqual(["A", "B", "C"]);
    expect(route.legs).toHaveLength(2);
    expect(route.legs[0].sameVenue).toBe(true);
    expect(route.legs[1].sameVenue).toBe(false);
    expect(route.legs[1]).toMatchObject({ fromLabel: "B", toLabel: "C" });
  });
});
