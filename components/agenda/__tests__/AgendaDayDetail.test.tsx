import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendaDayDetail } from "@/components/agenda/AgendaDayDetail";
import {
  resetOnboardingStore,
  useOnboardingStore,
} from "@/store/onboarding-store";
import type { HacktownEvent } from "@/types/event";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

const event = (overrides: Partial<HacktownEvent> = {}): HacktownEvent => ({
  id: "a",
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
    area: null,
    latitude: null,
    longitude: null,
    maps_url: null,
  },
  event_tracks: [],
  event_speakers: [],
  ...overrides,
});

describe("AgendaDayDetail", () => {
  beforeEach(() => {
    mockPush.mockReset();
    resetOnboardingStore();
    window.confirm = jest.fn(() => true);
  });

  it("empty state quando o dia não tem agenda", () => {
    render(<AgendaDayDetail dayIso="2026-09-05" events={[event()]} />);
    expect(
      screen.getByRole("heading", { name: /05 sáb/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /criar agenda/i }),
    ).toBeInTheDocument();
  });

  it("lista eventos com link do Google Calendar", () => {
    useOnboardingStore.getState().saveAgendaOption(1, {
      dayIso: "2026-09-05",
      eventIds: ["a"],
    });
    useOnboardingStore.getState().selectAgenda(1);

    render(<AgendaDayDetail dayIso="2026-09-05" events={[event()]} />);

    const calendar = screen.getByRole("link", {
      name: /adicionar ao google calendar/i,
    });
    expect(calendar).toHaveAttribute(
      "href",
      expect.stringContaining("https://calendar.google.com/calendar/render"),
    );
    expect(calendar).toHaveAttribute(
      "href",
      expect.stringContaining("Palco+Petrobras"),
    );
    expect(
      screen.getByRole("link", { name: /ver evento/i }),
    ).toHaveAttribute("href", "/programacao/a");
    expect(
      screen.getByRole("link", { name: /ver no mapa/i }),
    ).toHaveAttribute("href", "/mapa?dia=2026-09-05");
  });

  it("exclui e volta ao painel", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().saveAgendaOption(1, {
      dayIso: "2026-09-05",
      eventIds: ["a"],
    });
    useOnboardingStore.getState().selectAgenda(1);

    render(<AgendaDayDetail dayIso="2026-09-05" events={[event()]} />);
    await user.click(screen.getByRole("button", { name: /excluir agenda/i }));
    expect(useOnboardingStore.getState().savedAgendas["2026-09-05"]).toBeUndefined();
    expect(mockPush).toHaveBeenCalledWith("/minha-agenda");
  });
});
