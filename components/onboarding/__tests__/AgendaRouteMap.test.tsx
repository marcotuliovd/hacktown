import { render, screen } from "@testing-library/react";
import { AgendaRouteMap } from "@/components/onboarding/AgendaRouteMap";
import { resolveRoutePoint } from "@/lib/walking";
import type { OnboardingEvent } from "@/types/onboarding";

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

describe("AgendaRouteMap", () => {
  it("desenha a rota A → B quando os pins existem", () => {
    const points = [
      resolveRoutePoint(event({ id: "a" }), 0),
      resolveRoutePoint(event({ id: "b", venueName: "Coreto" }), 1),
    ];
    render(<AgendaRouteMap points={points} />);
    expect(
      screen.getByRole("img", { name: /rota a → b no mapa do festival/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('img[src="/mapa.svg"]')).not.toBeNull();
  });

  it("explica quando nenhum local tem pin", () => {
    const points = [
      resolveRoutePoint(event({ id: "a", venueName: "Lugar Sem Pin" }), 0),
    ];
    render(<AgendaRouteMap points={points} />);
    expect(
      screen.getByText(/sem pin no mapa do festival/i),
    ).toBeInTheDocument();
  });
});
