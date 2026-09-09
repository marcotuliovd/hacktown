import { render, screen } from "@testing-library/react";
import { EventDetail } from "@/components/schedule/EventDetail";
import type { EventSpeakerLink, HacktownEvent } from "@/types/event";

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
  image_url: "https://cdn.example/foto.jpg",
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

const speakers: EventSpeakerLink[] = [
  {
    speakers: {
      id: "s1",
      name: "Ada Lovelace",
      photo_url: "https://cdn.example/ada.jpg",
      mini_bio: "Matemática pioneira da computação.",
      cargo_empresa: "Analista, Analytical Engine",
    },
  },
  {
    speakers: {
      id: "s2",
      name: "Grace Hopper",
      photo_url: null,
      mini_bio: "Criou o primeiro compilador.",
      cargo_empresa: "Almirante, US Navy",
    },
  },
];

describe("EventDetail", () => {
  it("mostra título, horário, local, tipo, classificação e descrição", () => {
    render(<EventDetail event={event} />);
    expect(
      screen.getByRole("heading", { name: /futuro da ia/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Casa AWS")).toBeInTheDocument();
    expect(screen.getByText("Palestra")).toBeInTheDocument();
    expect(screen.getByText("Livre")).toBeInTheDocument();
    expect(screen.getByText("09:00 — 10:00")).toBeInTheDocument();
    expect(screen.getByText(/modelos generativos/i)).toBeInTheDocument();
  });

  it("renderiza a descrição completa em Inter e cor secundária", () => {
    const longDescription =
      "Primeiro parágrafo da conversa sobre modelos generativos.\n\nSegundo parágrafo com o restante da sinopse, sem corte.";
    const { container } = render(
      <EventDetail event={{ ...event, description: longDescription }} />,
    );
    expect(screen.getByRole("heading", { name: /sobre/i })).toBeInTheDocument();
    const paragraph = container.querySelector(
      "section[aria-labelledby='event-about'] p",
    );
    expect(paragraph).toHaveTextContent(
      "Primeiro parágrafo da conversa sobre modelos generativos. Segundo parágrafo com o restante da sinopse, sem corte.",
    );
    expect(paragraph).toHaveClass("font-sans");
    expect(paragraph).toHaveClass("text-text-secondary");
    expect(paragraph).toHaveClass("whitespace-pre-line");
  });

  it("expõe um link real para o Google Maps via lat/lng", () => {
    render(<EventDetail event={event} />);
    const link = screen.getByRole("link", { name: /como chegar/i });
    expect(link).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=-22.252,-45.703",
    );
  });

  it("prioriza maps_url quando preenchido", () => {
    render(
      <EventDetail
        event={{
          ...event,
          venue: {
            ...event.venue!,
            maps_url: "https://maps.google.com/?q=custom-venue",
          },
        }}
      />,
    );
    expect(screen.getByRole("link", { name: /como chegar/i })).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=custom-venue",
    );
  });

  it("trata a foto com grayscale/contrast", () => {
    render(<EventDetail event={event} />);
    const img = screen.getByAltText("Futuro da IA");
    expect(img.className).toContain("grayscale(100%)");
  });

  it("usa a foto do palestrante quando image_url é null", () => {
    render(
      <EventDetail
        event={{
          ...event,
          image_url: null,
          event_speakers: [
            {
              speakers: {
                id: "s1",
                name: "Ada",
                photo_url: "https://cdn.example/ada.jpg",
                mini_bio: null,
                cargo_empresa: null,
              },
            },
          ],
        }}
      />,
    );
    expect(screen.getByAltText("Futuro da IA")).toHaveAttribute(
      "src",
      "https://cdn.example/ada.jpg",
    );
  });

  it("lista todos os palestrantes com nome, cargo e mini_bio", () => {
    render(<EventDetail event={{ ...event, event_speakers: speakers }} />);
    expect(
      screen.getByRole("heading", { name: /palestrantes/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /ada lovelace/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Analista, Analytical Engine")).toBeInTheDocument();
    expect(
      screen.getByText("Matemática pioneira da computação."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /grace hopper/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Almirante, US Navy")).toBeInTheDocument();
    expect(screen.getByText("Criou o primeiro compilador.")).toBeInTheDocument();
  });

  it("não mostra a seção de palestrantes quando a lista está vazia", () => {
    render(<EventDetail event={event} />);
    expect(
      screen.queryByRole("heading", { name: /palestrantes/i }),
    ).not.toBeInTheDocument();
  });

  it("ignora links com speakers nulo e não quebra", () => {
    render(
      <EventDetail
        event={{
          ...event,
          event_speakers: [{ speakers: null }, speakers[0]],
        }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /ada lovelace/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /grace hopper/i }),
    ).not.toBeInTheDocument();
  });
});
