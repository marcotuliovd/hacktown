import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventModal } from "@/components/schedule/EventModal";
import type { HacktownEvent } from "@/types/event";

const event: HacktownEvent = {
  id: "evt-1",
  title: "Futuro da IA",
  description: "Uma conversa sobre modelos generativos.",
  event_date: "2026-09-05",
  start_time: "09:00:00",
  end_time: "10:00:00",
  activity_type: "Palestra",
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
    name: "Casa AWS",
    area: "Inatel",
    latitude: -22.252,
    longitude: -45.703,
    maps_url: null,
  },
  event_tracks: [],
  event_speakers: [],
};

describe("EventModal", () => {
  it("recebe o HacktownEvent e renderiza a ficha em tela cheia", () => {
    render(<EventModal event={event} onClose={jest.fn()} />);

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(
      screen.getByRole("heading", { level: 1, name: /futuro da ia/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Casa AWS")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ficha/i }),
    ).toHaveAttribute("href", "/programacao/evt-1");
  });

  it("chama onClose ao clicar em Fechar ou pressionar Escape", async () => {
    const onClose = jest.fn();
    render(<EventModal event={event} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
