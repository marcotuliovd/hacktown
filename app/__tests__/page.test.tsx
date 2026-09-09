import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import type { HacktownEvent } from "@/types/event";

jest.mock("@/services/api", () => ({
  getEvents: jest.fn(),
  getEventById: jest.fn(),
}));

import { getEventById, getEvents } from "@/services/api";

const featured: HacktownEvent = {
  id: "evt-1",
  title: "Abertura Oficial",
  description: null,
  event_date: "2026-09-05",
  start_time: "09:00:00",
  end_time: "10:00:00",
  activity_type: "Keynote",
  age_rating: "Livre",
  status: "publicado",
  guarda_chuva: false,
  is_evento_maior: true,
  image_url: null,
  parent_event_id: null,
  formato: "presencial",
  mediador: null,
  selo: null,
  registration_url: null,
  venue: {
    name: "Palco Principal",
    area: "Centro",
    latitude: null,
    longitude: null,
    maps_url: null,
  },
  event_tracks: [],
  event_speakers: [],
};

const second: HacktownEvent = {
  ...featured,
  id: "evt-2",
  title: "Futuro da IA",
  activity_type: "Palestra",
  is_evento_maior: false,
};

describe("Home (vitrine do design system)", () => {
  beforeEach(() => {
    jest.mocked(getEvents).mockResolvedValue([featured, second]);
    jest.mocked(getEventById).mockImplementation(async (id) =>
      [featured, second].find((event) => event.id === id) ?? null,
    );
  });

  it("renderiza sem erros e mostra o título principal", async () => {
    render(await Home());
    expect(
      screen.getByRole("heading", { level: 1, name: /sua agenda/i }),
    ).toBeInTheDocument();
  });

  it("renderiza os CTAs principais (Button)", async () => {
    render(await Home());
    expect(
      screen.getByRole("link", { name: /ver programação/i }),
    ).toHaveAttribute("href", "/programacao");
    expect(
      screen.getByRole("link", { name: /^minha agenda$/i }),
    ).toHaveAttribute("href", "/minha-agenda");
    expect(
      screen.getByRole("link", { name: /montar minha agenda/i }),
    ).toHaveAttribute("href", "/onboarding");
    expect(screen.getByRole("link", { name: /ver mapa/i })).toHaveAttribute(
      "href",
      "/mapa",
    );
  });

  it("renderiza o letreiro de alertas (Marquee)", async () => {
    render(await Home());
    expect(screen.getByRole("marquee")).toBeInTheDocument();
  });

  it("renderiza os cards em destaque (EventCard) com dados reais", async () => {
    render(await Home());
    expect(
      screen.getByRole("heading", { name: /abertura oficial/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /futuro da ia/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /saiba mais/i }).length,
    ).toBeGreaterThanOrEqual(2);
  });
});
