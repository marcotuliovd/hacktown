import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCard } from "@/components/ui/EventCard";
import type { HacktownEvent } from "@/types/event";

const sampleEvent = (overrides: Partial<HacktownEvent> = {}): HacktownEvent => ({
  id: "evt-1",
  title: "Abertura Oficial",
  description: "Abertura do festival",
  event_date: "2026-09-05",
  start_time: "09:00:00",
  end_time: "10:00:00",
  activity_type: "Palestra",
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
    latitude: -22.25,
    longitude: -45.7,
    maps_url: null,
  },
  event_tracks: [],
  event_speakers: [],
  ...overrides,
});

describe("EventCard", () => {
  it("renderiza título em tipografia display, horário, local e badge", () => {
    render(<EventCard event={sampleEvent()} />);

    const title = screen.getByRole("heading", { name: /abertura oficial/i });
    expect(title).toHaveClass("font-display");
    expect(screen.getByText("09:00 — 10:00")).toBeInTheDocument();
    expect(screen.getByText("Palco Principal")).toBeInTheDocument();
    expect(screen.getByText("Palestra")).toBeInTheDocument();
  });

  it("aplica estilo modular com borda fina", () => {
    const { container } = render(<EventCard event={sampleEvent()} />);
    const article = container.querySelector("article");
    expect(article).toHaveClass("border");
    expect(article).toHaveClass("border-subtle");
    expect(article).toHaveClass("rounded-none");
  });

  it("exibe a foto de capa do primeiro palestrante com filtro grayscale", () => {
    render(
      <EventCard
        event={sampleEvent({
          event_speakers: [
            {
              speakers: {
                id: "s1",
                name: "Ada Lovelace",
                photo_url: "https://cdn.example/ada.jpg",
                mini_bio: null,
                cargo_empresa: null,
              },
            },
          ],
        })}
      />,
    );

    const img = screen.getByAltText("Ada Lovelace");
    expect(img).toHaveAttribute("src", "https://cdn.example/ada.jpg");
    expect(img.className).toContain("grayscale(100%)");
  });

  it("não renderiza capa quando não há photo_url nem image_url", () => {
    render(<EventCard event={sampleEvent()} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("usa image_url quando o palestrante não tem foto", () => {
    render(
      <EventCard
        event={sampleEvent({ image_url: "https://cdn.example/cover.jpg" })}
      />,
    );
    expect(screen.getByAltText("Abertura Oficial")).toHaveAttribute(
      "src",
      "https://cdn.example/cover.jpg",
    );
  });

  it("volta ao placeholder se a capa falhar ao carregar", () => {
    render(
      <EventCard
        event={sampleEvent({
          event_speakers: [
            {
              speakers: {
                id: "s1",
                name: "Ada Lovelace",
                photo_url: "https://cdn.example/ada.jpg",
                mini_bio: null,
                cargo_empresa: null,
              },
            },
          ],
        })}
      />,
    );
    fireEvent.error(screen.getByAltText("Ada Lovelace"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("aplica a cor de acento escolhida na barra de destaque", () => {
    const { container } = render(
      <EventCard event={sampleEvent()} accent="cyan" />,
    );
    const article = container.querySelector("article");
    expect(article?.className).toContain("before:bg-neon-cyan");
  });

  it("abre a aba cheia com o evento completo ao clicar em Saiba Mais", async () => {
    const onLearnMore = jest.fn();
    render(
      <EventCard event={sampleEvent()} onLearnMore={onLearnMore} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /saiba mais/i }),
    );

    expect(onLearnMore).toHaveBeenCalledTimes(1);
    expect(onLearnMore).toHaveBeenCalledWith(
      expect.objectContaining({ id: "evt-1", title: "Abertura Oficial" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /abertura oficial/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/abertura do festival/i)).toBeInTheDocument();
  });

  it("fecha a aba cheia pelo botão Fechar", async () => {
    render(<EventCard event={sampleEvent()} />);

    await userEvent.click(
      screen.getByRole("button", { name: /saiba mais/i }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /fechar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
