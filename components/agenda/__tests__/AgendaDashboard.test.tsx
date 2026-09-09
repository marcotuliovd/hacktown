import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendaDashboard } from "@/components/agenda/AgendaDashboard";
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
  description: "Abertura",
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

describe("AgendaDashboard", () => {
  beforeEach(() => {
    mockPush.mockReset();
    resetOnboardingStore();
    window.confirm = jest.fn(() => true);
  });

  it("mostra empty state para os 5 dias", () => {
    render(<AgendaDashboard events={[]} />);
    expect(
      screen.getByRole("heading", { name: /minha agenda/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /criar agenda/i })).toHaveLength(
      5,
    );
  });

  it("exibe card da agenda salva com editar e excluir", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().saveAgendaOption(1, {
      dayIso: "2026-09-05",
      eventIds: ["a"],
    });
    useOnboardingStore.getState().selectAgenda(1);

    render(<AgendaDashboard events={[event()]} />);

    expect(screen.getByText("Abertura Oficial")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver agenda/i }),
    ).toHaveAttribute("href", "/minha-agenda/2026-09-05");
    expect(
      screen.getByRole("link", { name: /ver no mapa/i }),
    ).toHaveAttribute("href", "/mapa?dia=2026-09-05");

    await user.click(screen.getByRole("button", { name: /^editar$/i }));
    expect(mockPush).toHaveBeenCalledWith("/onboarding/opcao/1?dia=2026-09-05");

    await user.click(screen.getByRole("button", { name: /^excluir$/i }));
    expect(useOnboardingStore.getState().savedAgendas["2026-09-05"]).toBeUndefined();
  });

  it("criar agenda vai ao onboarding sem trilhas", async () => {
    const user = userEvent.setup();
    render(<AgendaDashboard events={[]} />);
    await user.click(screen.getAllByRole("button", { name: /criar agenda/i })[0]);
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("criar agenda vai à opção 1 do dia quando já há trilhas", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().setFavoriteTrackIds(["ia"]);
    render(<AgendaDashboard events={[]} />);
    await user.click(screen.getAllByRole("button", { name: /criar agenda/i })[2]);
    expect(mockPush).toHaveBeenCalledWith("/onboarding/opcao/1?dia=2026-09-05");
  });
});
