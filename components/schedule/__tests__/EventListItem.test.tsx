import { render, screen } from "@testing-library/react";
import { EventListItem } from "@/components/schedule/EventListItem";
import type { EventListItemData } from "@/types/event";

const item = (
  overrides: Partial<EventListItemData> = {},
): EventListItemData => ({
  id: "evt-1",
  title: "Futuro da IA",
  event_date: "2026-09-05",
  start_time: "09:00:00",
  end_time: "10:00:00",
  venueName: "Casa AWS",
  activityType: "Palestra",
  ...overrides,
});

describe("EventListItem", () => {
  it("renderiza título, local e link para a ficha", () => {
    render(<EventListItem event={item()} />);
    expect(
      screen.getByRole("heading", { name: /futuro da ia/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/casa aws/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/programacao/evt-1",
    );
  });

  it("reduz a opacidade quando o evento já acabou", () => {
    render(
      <EventListItem
        event={item({ event_date: "2020-01-01", end_time: "10:00:00" })}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("data-ended", "true");
    expect(link.className).toContain("opacity-40");
  });

  it("não esmaece evento ainda em andamento", () => {
    render(
      <EventListItem
        event={item({ event_date: "2099-01-01", end_time: "10:00:00" })}
      />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-ended", "false");
  });
});
