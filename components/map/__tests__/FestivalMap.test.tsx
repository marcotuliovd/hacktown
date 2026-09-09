import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FestivalMap } from "@/components/map/FestivalMap";

describe("FestivalMap", () => {
  it("renderiza os pins numerados e abre o card ao clicar", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(
      <div style={{ width: 400, height: 300 }}>
        <FestivalMap selectedN={null} onSelect={onSelect} />
      </div>,
    );

    const pin = screen.getByRole("button", { name: /30\. palco petrobras/i });
    await user.click(pin);
    expect(onSelect).toHaveBeenCalledWith(30);
  });

  it("mostra o card do local selecionado", () => {
    render(
      <FestivalMap selectedN={30} highlightedNs={[30]} onSelect={jest.fn()} />,
    );
    expect(
      screen.getByRole("heading", { name: /palco petrobras/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/arraste · pinça para zoom/i)).toBeInTheDocument();
  });
});
