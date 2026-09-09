import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapScreen } from "@/components/map/MapScreen";
import {
  resetOnboardingStore,
  useOnboardingStore,
} from "@/store/onboarding-store";
import type { HacktownEvent } from "@/types/event";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
  }),
}));

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

describe("MapScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    resetOnboardingStore();
  });

  it("mostra empty state sem agenda salva", () => {
    const { container } = render(<MapScreen events={[event()]} />);
    expect(
      screen.getByRole("link", { name: /montar minha agenda/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("application", { name: /mapa interativo do hacktown/i }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex-col", "lg:flex-row");
  });

  it("lista os locais da agenda e destaca o pin ao clicar", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().saveAgendaOption(1, {
      dayIso: "2026-09-05",
      eventIds: ["a", "b"],
    });
    useOnboardingStore.getState().selectAgenda(1);

    render(
      <MapScreen
        events={[
          event(),
          event({
            id: "b",
            title: "No coreto",
            start_time: "11:00:00",
            end_time: "12:00:00",
            venue: {
              name: "Coreto",
              area: null,
              latitude: null,
              longitude: null,
              maps_url: null,
            },
          }),
        ]}
        initialDay="2026-09-05"
      />,
    );

    expect(screen.getAllByText("Palco Petrobras").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Coreto").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /no coreto/i }));
    expect(
      screen.getByRole("heading", { name: /coreto/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /10\. coreto/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
