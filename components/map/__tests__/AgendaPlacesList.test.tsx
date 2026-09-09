import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendaPlacesList } from "@/components/map/AgendaPlacesList";
import type { AgendaPlaceStop } from "@/lib/agenda-venues";

const stop = (overrides: Partial<AgendaPlaceStop> = {}): AgendaPlaceStop => ({
  key: "pin:30",
  n: 30,
  name: "Palco Petrobras",
  x: 762.8,
  y: 777.6,
  events: [
    {
      id: "a",
      title: "Abertura Oficial",
      startTime: "09:00:00",
      endTime: "10:00:00",
    },
  ],
  ...overrides,
});

describe("AgendaPlacesList", () => {
  it("pede para montar a agenda quando não há programação salva", () => {
    render(
      <AgendaPlacesList
        stops={[]}
        selectedN={null}
        onSelect={jest.fn()}
        hasAgenda={false}
        hydrated
      />,
    );
    expect(
      screen.getByRole("link", { name: /montar minha agenda/i }),
    ).toHaveAttribute("href", "/onboarding");
  });

  it("seleciona o pin ao clicar no local da lista", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(
      <AgendaPlacesList
        stops={[stop(), stop({ key: "pin:10", n: 10, name: "Coreto" })]}
        selectedN={null}
        onSelect={onSelect}
        hasAgenda
        hydrated
      />,
    );

    await user.click(screen.getByRole("button", { name: /coreto/i }));
    expect(onSelect).toHaveBeenCalledWith(10, "pin:10");
  });

  it("avisa quando o local não tem pin", () => {
    render(
      <AgendaPlacesList
        stops={[
          stop({
            key: "name:galpao",
            n: null,
            name: "Galpão Inventado",
            x: null,
            y: null,
          }),
        ]}
        selectedN={null}
        onSelect={jest.fn()}
        hasAgenda
        hydrated
      />,
    );
    expect(screen.getByText(/sem pin no mapa/i)).toBeInTheDocument();
  });

  it("inclui o dia na lista quando informado", () => {
    render(
      <AgendaPlacesList
        stops={[stop()]}
        selectedN={null}
        onSelect={jest.fn()}
        hasAgenda
        hydrated
        dayLabel="05 sáb · opção 1"
      />,
    );
    expect(
      screen.getByRole("heading", { name: /05 sáb · opção 1/i }),
    ).toBeInTheDocument();
  });
});
