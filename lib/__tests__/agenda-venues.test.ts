import {
  agendaPlaceTimeLabel,
  buildAgendaPlaces,
  highlightedPinNumbers,
  resolveMapDay,
} from "@/lib/agenda-venues";
import type { HacktownEvent } from "@/types/event";

const event = (overrides: Partial<HacktownEvent> = {}): HacktownEvent => ({
  id: "a",
  title: "Abertura Oficial",
  description: null,
  event_date: "2026-09-05",
  start_time: "09:00:00",
  end_time: "10:00:00",
  activity_type: "Keynote",
  age_rating: "Livre",
  status: "publicado",
  guarda_chuva: false,
  is_evento_maior: false,
  image_url: null,
  parent_event_id: null,
  formato: "presencial",
  mediador: null,
  selo: null,
  registration_url: null,
  venue: {
    name: "Palco Petrobras",
    area: null,
    latitude: null,
    longitude: null,
    maps_url: null,
  },
  event_tracks: [],
  event_speakers: [],
  ...overrides,
});

describe("buildAgendaPlaces", () => {
  it("unifica o mesmo local e preserva a ordem de visita", () => {
    const stops = buildAgendaPlaces([
      event({ id: "a", venue: { name: "Palco Petrobras", area: null, latitude: null, longitude: null, maps_url: null } }),
      event({
        id: "b",
        title: "No coreto",
        start_time: "11:00:00",
        end_time: "12:00:00",
        venue: { name: "Coreto", area: null, latitude: null, longitude: null, maps_url: null },
      }),
      event({
        id: "c",
        title: "Volta ao palco",
        start_time: "16:00:00",
        end_time: "17:00:00",
        venue: { name: "palco petrobras", area: null, latitude: null, longitude: null, maps_url: null },
      }),
    ]);

    expect(stops.map((stop) => stop.n)).toEqual([30, 10]);
    expect(stops[0].events.map((item) => item.id)).toEqual(["a", "c"]);
    expect(stops[1].name).toBe("Coreto");
    expect(agendaPlaceTimeLabel(stops[0])).toBe("09:00 — 17:00");
  });

  it("mantém local sem pin na lista", () => {
    const stops = buildAgendaPlaces([
      event({
        id: "x",
        venue: {
          name: "Galpão Inventado",
          area: null,
          latitude: null,
          longitude: null,
          maps_url: null,
        },
      }),
    ]);

    expect(stops).toHaveLength(1);
    expect(stops[0].n).toBeNull();
    expect(stops[0].name).toBe("Galpão Inventado");
    expect(highlightedPinNumbers(stops)).toEqual([]);
  });

  it("trata evento sem venue como parada própria", () => {
    const stops = buildAgendaPlaces([
      event({ id: "n1", venue: null }),
      event({ id: "n2", title: "Outro", venue: null }),
    ]);
    expect(stops).toHaveLength(2);
    expect(stops.every((stop) => stop.n === null)).toBe(true);
    expect(stops[0].name).toBe("Local a confirmar");
  });
});

describe("resolveMapDay", () => {
  const now = new Date("2026-09-05T15:00:00-03:00");

  it("prioriza o dia pedido quando há agenda salva", () => {
    expect(
      resolveMapDay(["2026-09-03", "2026-09-07"], "2026-09-07", now),
    ).toBe("2026-09-07");
  });

  it("usa hoje quando esse dia tem agenda", () => {
    expect(resolveMapDay(["2026-09-05", "2026-09-07"], undefined, now)).toBe(
      "2026-09-05",
    );
  });

  it("cai no primeiro dia salvo se hoje não tem agenda", () => {
    expect(resolveMapDay(["2026-09-03", "2026-09-07"], undefined, now)).toBe(
      "2026-09-03",
    );
  });

  it("retorna null sem agendas e sem dia pedido", () => {
    expect(resolveMapDay([], undefined, now)).toBeNull();
  });
});
