import {
  combineFestivalDateTime,
  getDefaultFestivalDay,
  isEventEnded,
  formatTimeRange,
  eventsByIds,
  filterEventsByDay,
  getEventCardCoverUrl,
  getSpeakerCoverUrl,
  groupEventsByStartTime,
  pickFeaturedEvents,
  resolveFestivalDay,
  toFestivalDateIso,
  toListItem,
} from "@/lib/schedule";
import type { HacktownEvent } from "@/types/event";

const sampleEvent = (overrides: Partial<HacktownEvent> = {}): HacktownEvent => ({
  id: "1",
  title: "Abertura Oficial",
  description: "Abertura do festival",
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
    area: "Centro",
    latitude: -22.25,
    longitude: -45.7,
    maps_url: null,
  },
  event_tracks: [],
  event_speakers: [],
  ...overrides,
});

describe("schedule helpers", () => {
  it("converte timestamp para a data civil em America/Sao_Paulo", () => {
    expect(toFestivalDateIso("2026-09-05T00:30:00.000Z")).toBe("2026-09-04");
    expect(toFestivalDateIso("2026-09-05T12:00:00.000Z")).toBe("2026-09-05");
  });

  it("combina event_date + horário local de São Paulo", () => {
    const date = combineFestivalDateTime("2026-09-03", "09:00:00");
    expect(date).not.toBeNull();
    expect(date?.toISOString()).toBe("2026-09-03T12:00:00.000Z");
  });

  it("antes do festival retorna o primeiro dia", () => {
    expect(getDefaultFestivalDay(new Date("2026-08-01T15:00:00.000Z"))).toBe(
      "2026-09-03",
    );
  });

  it("depois do festival retorna o último dia (8/set → 07/set)", () => {
    expect(getDefaultFestivalDay(new Date("2026-09-08T15:00:00.000Z"))).toBe(
      "2026-09-07",
    );
  });

  it("durante o festival retorna o dia corrente no fuso de SP", () => {
    expect(getDefaultFestivalDay(new Date("2026-09-05T15:00:00.000Z"))).toBe(
      "2026-09-05",
    );
  });

  it("resolveFestivalDay aceita um dia válido e ignora inválido", () => {
    expect(resolveFestivalDay("2026-09-04")).toBe("2026-09-04");
    expect(
      resolveFestivalDay("nao-e-dia", new Date("2026-09-08T12:00:00.000Z")),
    ).toBe("2026-09-07");
  });

  it("marca evento como encerrado quando event_date + end_time já passaram", () => {
    expect(
      isEventEnded(
        "2026-09-03",
        "10:00:00",
        new Date("2026-09-03T14:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      isEventEnded(
        "2026-09-03",
        "10:00:00",
        new Date("2026-09-03T12:30:00.000Z"),
      ),
    ).toBe(false);
  });

  it("formata o intervalo a partir de HH:MM:SS", () => {
    expect(formatTimeRange("09:00:00", "10:30:00")).toBe("09:00 — 10:30");
  });

  it("resolve eventos na ordem dos ids", () => {
    const events = [
      sampleEvent({ id: "a", title: "A" }),
      sampleEvent({ id: "b", title: "B" }),
    ];
    expect(eventsByIds(events, ["b", "missing", "a"]).map((e) => e.id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("filtra eventos pelo event_date", () => {
    const events = [
      sampleEvent({ id: "a", event_date: "2026-09-05" }),
      sampleEvent({ id: "b", event_date: "2026-09-06" }),
    ];
    expect(filterEventsByDay(events, "2026-09-05").map((e) => e.id)).toEqual([
      "a",
    ]);
  });

  it("agrupa itens da lista pelo horário de início", () => {
    const groups = groupEventsByStartTime([
      toListItem(sampleEvent({ id: "a", start_time: "09:00:00" })),
      toListItem(
        sampleEvent({ id: "b", title: "Outra", start_time: "09:00:00" }),
      ),
      toListItem(sampleEvent({ id: "c", start_time: "11:00:00" })),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].time).toBe("09:00");
    expect(groups[0].events).toHaveLength(2);
  });

  it("lê a capa do primeiro palestrante quando photo_url existe", () => {
    const event = sampleEvent({
      event_speakers: [
        {
          speakers: {
            id: "s1",
            name: "Ada",
            photo_url: "https://cdn.example/ada.jpg",
            mini_bio: null,
            cargo_empresa: null,
          },
        },
      ],
    });
    expect(getSpeakerCoverUrl(event)).toBe("https://cdn.example/ada.jpg");
    expect(getEventCardCoverUrl(event)).toBe("https://cdn.example/ada.jpg");
  });

  it("cai para image_url no card quando não há foto do palestrante", () => {
    const event = sampleEvent({ image_url: "https://cdn.example/cover.jpg" });
    expect(getSpeakerCoverUrl(event)).toBeUndefined();
    expect(getEventCardCoverUrl(event)).toBe("https://cdn.example/cover.jpg");
  });

  it("prioriza eventos maiores com capa na vitrine", () => {
    const events = [
      sampleEvent({ id: "a", title: "Normal", is_evento_maior: false }),
      sampleEvent({
        id: "b",
        title: "Destaque",
        is_evento_maior: true,
        image_url: "https://cdn.example/b.jpg",
      }),
      sampleEvent({ id: "c", title: "Outro", is_evento_maior: false }),
    ];
    expect(pickFeaturedEvents(events, 1).map((event) => event.id)).toEqual([
      "b",
    ]);
  });
});
