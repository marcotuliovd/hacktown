import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendaCompare } from "@/components/onboarding/AgendaCompare";
import {
  resetOnboardingStore,
  useOnboardingStore,
} from "@/store/onboarding-store";
import type { OnboardingEvent } from "@/types/onboarding";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

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
  trackIds: ["ia"],
  ...overrides,
});

const events = [
  event({ id: "a", title: "Abertura", start_time: "09:00:00", end_time: "10:00:00" }),
  event({
    id: "b",
    title: "Painel Coreto",
    venueName: "Coreto",
    start_time: "11:00:00",
    end_time: "12:00:00",
  }),
  event({
    id: "c",
    title: "Show Inatel",
    venueName: "Inatel",
    start_time: "14:00:00",
    end_time: "15:00:00",
  }),
];

describe("AgendaCompare", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPush.mockReset();
    resetOnboardingStore();
  });

  it("redireciona para a opção 1 sem rascunhos", () => {
    render(<AgendaCompare events={events} />);
    expect(mockReplace).toHaveBeenCalledWith("/onboarding/opcao/1");
  });

  it("renderiza um card por opção salva", () => {
    const { saveAgendaOption } = useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a", "b"] });
    saveAgendaOption(2, { dayIso: "2026-09-05", eventIds: ["c"] });

    render(<AgendaCompare events={events} />);

    expect(screen.getByLabelText("Opção 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Opção 2")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /selecionar esta agenda/i }),
    ).toHaveLength(2);
    expect(screen.getByText("Abertura")).toBeInTheDocument();
    expect(screen.getByText("Show Inatel")).toBeInTheDocument();
  });

  it("salva a agenda escolhida e mostra o sucesso", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().saveAgendaOption(1, {
      dayIso: "2026-09-05",
      eventIds: ["a", "b"],
    });

    render(<AgendaCompare events={events} />);
    await user.click(
      screen.getByRole("button", { name: /selecionar esta agenda/i }),
    );

    expect(useOnboardingStore.getState().selectedAgenda).toEqual({
      option: 1,
      dayIso: "2026-09-05",
      eventIds: ["a", "b"],
    });
    expect(useOnboardingStore.getState().savedAgendas["2026-09-05"]).toEqual({
      option: 1,
      dayIso: "2026-09-05",
      eventIds: ["a", "b"],
    });
    expect(mockPush).toHaveBeenCalledWith("/minha-agenda/2026-09-05");
    expect(
      screen.getByRole("heading", { name: /agenda do dia definida/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver minha agenda/i }),
    ).toHaveAttribute("href", "/minha-agenda/2026-09-05");
  });

  it("permite comparar um dia mesmo com outro já salvo", () => {
    const { saveAgendaOption, selectAgenda } = useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-04", eventIds: ["a"] });
    selectAgenda(1);
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["b"] });

    render(<AgendaCompare events={events} />);

    expect(screen.getByLabelText("Opção 1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /selecionar esta agenda/i }),
    ).toBeInTheDocument();
  });
});
