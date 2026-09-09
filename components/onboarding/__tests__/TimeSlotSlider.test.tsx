import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeSlotSlider } from "@/components/onboarding/TimeSlotSlider";
import type { OnboardingEvent, OnboardingTimeGroup } from "@/types/onboarding";

const event = (
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
  trackIds: ["ia"],
  ...overrides,
});

const groups: OnboardingTimeGroup[] = [
  {
    time: "09:00",
    events: [event({ id: "a", title: "Abertura", start_time: "09:00:00" })],
  },
  {
    time: "10:00",
    events: [event({ id: "b", title: "Painel", start_time: "10:00:00" })],
  },
];

describe("TimeSlotSlider", () => {
  it("mostra o horário atual e o botão de pular", () => {
    render(
      <TimeSlotSlider
        groups={groups}
        decisions={{}}
        currentSlotTime="09:00"
        onPick={jest.fn()}
        onSkip={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /às 09:00/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /pular horário/i }),
    ).toBeInTheDocument();
  });

  it("dispara onPick ao escolher um evento", async () => {
    const onPick = jest.fn();
    const user = userEvent.setup();
    render(
      <TimeSlotSlider
        groups={groups.slice(0, 1)}
        decisions={{}}
        currentSlotTime="09:00"
        onPick={onPick}
        onSkip={jest.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /escolher/i }));
    expect(onPick).toHaveBeenCalledWith("09:00", "a");
  });

  it("dispara onSkip no horário atual", async () => {
    const onSkip = jest.fn();
    const user = userEvent.setup();
    render(
      <TimeSlotSlider
        groups={groups.slice(0, 1)}
        decisions={{}}
        currentSlotTime="09:00"
        onPick={jest.fn()}
        onSkip={onSkip}
      />,
    );
    await user.click(screen.getByRole("button", { name: /pular horário/i }));
    expect(onSkip).toHaveBeenCalledWith("09:00");
  });
});
