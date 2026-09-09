import { render, screen } from "@testing-library/react";
import { DayTabs } from "@/components/schedule/DayTabs";

describe("DayTabs", () => {
  it("marca o dia selecionado e gera links para os 5 dias", () => {
    render(<DayTabs selected="2026-09-07" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    const active = screen.getByRole("link", { current: "date" });
    expect(active).toHaveAttribute("href", "/programacao?dia=2026-09-07");
  });

  it("aceita href customizado para o onboarding", () => {
    render(
      <DayTabs
        selected="2026-09-05"
        hrefForDay={(iso) => `/onboarding/opcao/1?dia=${iso}`}
      />,
    );
    expect(screen.getByRole("link", { current: "date" })).toHaveAttribute(
      "href",
      "/onboarding/opcao/1?dia=2026-09-05",
    );
  });
});
