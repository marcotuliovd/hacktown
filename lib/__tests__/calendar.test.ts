import {
  buildCalendarLocation,
  buildGoogleCalendarUrl,
  toGoogleCalendarStamp,
} from "@/lib/calendar";
import type { HacktownEvent } from "@/types/event";

const sampleEvent = (overrides: Partial<HacktownEvent> = {}): HacktownEvent => ({
  id: "1",
  title: "Abertura Oficial",
  description: "Abertura do festival",
  event_date: "2026-09-03",
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

describe("toGoogleCalendarStamp", () => {
  it("formata UTC como YYYYMMDDTHHMMSSZ", () => {
    expect(toGoogleCalendarStamp(new Date("2026-09-03T12:00:00.000Z"))).toBe(
      "20260903T120000Z",
    );
  });
});

describe("buildCalendarLocation", () => {
  it("injeta venue.name + HackTown + cidade", () => {
    expect(buildCalendarLocation("Palco Petrobras")).toBe(
      "Palco Petrobras, HackTown, Santa Rita do Sapucaí, MG",
    );
  });

  it("cai para HackTown + cidade sem venue", () => {
    expect(buildCalendarLocation(null)).toBe(
      "HackTown, Santa Rita do Sapucaí, MG",
    );
  });
});

describe("buildGoogleCalendarUrl", () => {
  it("monta TEMPLATE com dates UTC, título e location", () => {
    const url = buildGoogleCalendarUrl(sampleEvent());
    expect(url).not.toBeNull();
    const parsed = new URL(url!);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://calendar.google.com/calendar/render",
    );
    expect(parsed.searchParams.get("action")).toBe("TEMPLATE");
    expect(parsed.searchParams.get("text")).toBe("Abertura Oficial");
    expect(parsed.searchParams.get("dates")).toBe(
      "20260903T120000Z/20260903T130000Z",
    );
    expect(parsed.searchParams.get("details")).toBe("Abertura do festival");
    expect(parsed.searchParams.get("location")).toBe(
      "Palco Petrobras, HackTown, Santa Rita do Sapucaí, MG",
    );
  });

  it("codifica título com caracteres especiais", () => {
    const url = buildGoogleCalendarUrl(
      sampleEvent({ title: "IA & Criatividade: o futuro" }),
    );
    expect(url).toContain("IA");
    expect(decodeURIComponent(new URL(url!).searchParams.get("text")!)).toBe(
      "IA & Criatividade: o futuro",
    );
  });

  it("retorna null com horário inválido", () => {
    expect(
      buildGoogleCalendarUrl(sampleEvent({ start_time: "não-é-hora" })),
    ).toBeNull();
  });
});
