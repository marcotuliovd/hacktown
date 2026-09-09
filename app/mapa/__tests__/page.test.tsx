import { render, screen } from "@testing-library/react";
import MapaPage from "@/app/mapa/page";
import type { HacktownEvent } from "@/types/event";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/services/api", () => ({
  EVENTS_REVALIDATE_SECONDS: 3600,
  getEvents: jest.fn(),
}));

import { getEvents } from "@/services/api";

const sample: HacktownEvent = {
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
    name: "Palco Petrobras",
    area: null,
    latitude: null,
    longitude: null,
    maps_url: null,
  },
  event_tracks: [],
  event_speakers: [],
};

describe("Mapa page", () => {
  beforeEach(() => {
    jest.mocked(getEvents).mockResolvedValue([sample]);
  });

  it("renderiza o mapa interativo", async () => {
    render(await MapaPage({ searchParams: {} }));
    expect(
      screen.getByRole("application", { name: /mapa interativo do hacktown/i }),
    ).toBeInTheDocument();
  });
});
