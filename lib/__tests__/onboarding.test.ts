import {
  applySlotDecision,
  completeDecisionsWithSkips,
  currentSlotTime,
  decisionsFromEventIds,
  eventsFromIds,
  extractUniqueTracks,
  filterEventsByTracks,
  groupOnboardingEvents,
  hasAtLeastOnePick,
  isAgendaComplete,
  parseAgendaOptionIndex,
  pickedEventIds,
  rewindDecisions,
  toOnboardingEvent,
  visibleGroups,
} from "@/lib/onboarding";
import type { HacktownEvent } from "@/types/event";
import type { OnboardingEvent, SlotDecisions } from "@/types/onboarding";

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
  event_tracks: [
    {
      tracks: {
        id: "track-ia",
        name: "Inteligência Artificial",
        code: "01",
      },
    },
  ],
  event_speakers: [],
  ...overrides,
});

const item = (
  overrides: Partial<OnboardingEvent> & Pick<OnboardingEvent, "id">,
): OnboardingEvent => ({
  title: `Evento ${overrides.id}`,
  event_date: "2026-09-05",
  start_time: "09:00:00",
  end_time: "10:00:00",
  venueName: "Palco",
  latitude: null,
  longitude: null,
  activityType: "Palestra",
  trackIds: ["track-ia"],
  ...overrides,
});

describe("parseAgendaOptionIndex", () => {
  it("aceita 1, 2 e 3", () => {
    expect(parseAgendaOptionIndex("1")).toBe(1);
    expect(parseAgendaOptionIndex("2")).toBe(2);
    expect(parseAgendaOptionIndex("3")).toBe(3);
  });

  it("rejeita valores inválidos", () => {
    expect(parseAgendaOptionIndex("0")).toBeNull();
    expect(parseAgendaOptionIndex("4")).toBeNull();
    expect(parseAgendaOptionIndex("foo")).toBeNull();
  });
});

describe("toOnboardingEvent / extractUniqueTracks", () => {
  it("extrai trackIds e omite description/speakers", () => {
    const event = toOnboardingEvent(sampleEvent());
    expect(event.trackIds).toEqual(["track-ia"]);
    expect(event.venueName).toBe("Palco Petrobras");
    expect(event.latitude).toBe(-22.25);
    expect(event.longitude).toBe(-45.7);
    expect(event).not.toHaveProperty("description");
  });

  it("lista trilhas únicas ordenadas por nome", () => {
    const tracks = extractUniqueTracks([
      sampleEvent({
        id: "a",
        event_tracks: [
          { tracks: { id: "z", name: "Saúde", code: "17" } },
        ],
      }),
      sampleEvent({
        id: "b",
        event_tracks: [
          { tracks: { id: "a", name: "Arte", code: "02" } },
          { tracks: { id: "z", name: "Saúde", code: "17" } },
        ],
      }),
      sampleEvent({
        id: "c",
        event_tracks: [{ tracks: { id: null, name: "Sem id", code: null } }],
      }),
    ]);
    expect(tracks.map((t) => t.name)).toEqual(["Arte", "Saúde"]);
  });
});

describe("eventsFromIds", () => {
  it("preserva a ordem dos IDs e ignora ausentes", () => {
    const events = [
      item({ id: "a" }),
      item({ id: "b" }),
      item({ id: "c" }),
    ];
    expect(eventsFromIds(events, ["c", "missing", "a"]).map((e) => e.id)).toEqual(
      ["c", "a"],
    );
  });
});

describe("filterEventsByTracks", () => {
  const events = [
    item({ id: "ia", trackIds: ["track-ia"] }),
    item({ id: "saude", trackIds: ["track-saude"] }),
    item({ id: "both", trackIds: ["track-ia", "track-saude"] }),
  ];

  it("retorna vazio sem trilhas selecionadas", () => {
    expect(filterEventsByTracks(events, [])).toEqual([]);
  });

  it("mantém eventos que cruzam qualquer trilha favorita", () => {
    expect(
      filterEventsByTracks(events, ["track-ia"]).map((e) => e.id),
    ).toEqual(["ia", "both"]);
  });
});

describe("groupOnboardingEvents", () => {
  it("agrupa e ordena por horário de início", () => {
    const groups = groupOnboardingEvents([
      item({ id: "c", start_time: "11:00:00" }),
      item({ id: "a", start_time: "09:00:00" }),
      item({ id: "b", start_time: "09:00:00" }),
    ]);
    expect(groups.map((g) => g.time)).toEqual(["09:00", "11:00"]);
    expect(groups[0].events).toHaveLength(2);
  });
});

describe("cursor sequencial", () => {
  const groups = groupOnboardingEvents([
    item({ id: "a", start_time: "09:00:00", end_time: "10:00:00" }),
    item({ id: "b", start_time: "09:00:00", end_time: "09:30:00" }),
    item({ id: "c", start_time: "09:30:00", end_time: "10:30:00" }),
    item({ id: "d", start_time: "10:00:00", end_time: "11:00:00" }),
    item({ id: "e", start_time: "11:00:00", end_time: "12:00:00" }),
  ]);

  it("começa no primeiro horário", () => {
    expect(currentSlotTime(groups, {})).toBe("09:00");
    expect(visibleGroups(groups, {}).map((g) => g.time)).toEqual(["09:00"]);
  });

  it("após escolher 09h–10h avança para as 10h (pula 09:30)", () => {
    const decisions = applySlotDecision({}, "09:00", {
      kind: "pick",
      eventId: "a",
    });
    expect(currentSlotTime(groups, decisions)).toBe("10:00");
    expect(visibleGroups(groups, decisions).map((g) => g.time)).toEqual([
      "09:00",
      "10:00",
    ]);
  });

  it("após escolher 09h–09:30 avança para as 09:30", () => {
    const decisions = applySlotDecision({}, "09:00", {
      kind: "pick",
      eventId: "b",
    });
    expect(currentSlotTime(groups, decisions)).toBe("09:30");
  });

  it("pular um horário avança para o próximo grupo", () => {
    const decisions = applySlotDecision({}, "09:00", { kind: "skip" });
    expect(currentSlotTime(groups, decisions)).toBe("09:30");
  });

  it("trocar a escolha descarta decisões posteriores", () => {
    let decisions: SlotDecisions = applySlotDecision({}, "09:00", {
      kind: "pick",
      eventId: "a",
    });
    decisions = applySlotDecision(decisions, "10:00", {
      kind: "pick",
      eventId: "d",
    });
    expect(pickedEventIds(groups, decisions)).toEqual(["a", "d"]);

    decisions = applySlotDecision(decisions, "09:00", {
      kind: "pick",
      eventId: "b",
    });
    expect(pickedEventIds(groups, decisions)).toEqual(["b"]);
    expect(currentSlotTime(groups, decisions)).toBe("09:30");
  });

  it("rewindDecisions remove a partir do horário informado", () => {
    const decisions: SlotDecisions = {
      "09:00": { kind: "pick", eventId: "a" },
      "10:00": { kind: "skip" },
    };
    expect(rewindDecisions(decisions, "10:00")).toEqual({
      "09:00": { kind: "pick", eventId: "a" },
    });
  });

  it("marca a agenda como completa quando não há próximo slot", () => {
    let decisions: SlotDecisions = applySlotDecision({}, "09:00", {
      kind: "pick",
      eventId: "a",
    });
    decisions = applySlotDecision(decisions, "10:00", {
      kind: "pick",
      eventId: "d",
    });
    decisions = applySlotDecision(decisions, "11:00", {
      kind: "pick",
      eventId: "e",
    });
    expect(isAgendaComplete(groups, decisions)).toBe(true);
    expect(hasAtLeastOnePick(decisions)).toBe(true);
    expect(currentSlotTime(groups, decisions)).toBeNull();
  });

  it("reconstrói picks e completa o dia com skips", () => {
    const restored = decisionsFromEventIds(groups, ["a", "e"]);
    expect(pickedEventIds(groups, restored)).toEqual(["a", "e"]);
    const completed = completeDecisionsWithSkips(groups, restored);
    expect(isAgendaComplete(groups, completed)).toBe(true);
    expect(completed["10:00"]).toEqual({ kind: "skip" });
  });
});
