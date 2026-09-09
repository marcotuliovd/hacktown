import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/schedule/SiteHeader";

describe("SiteHeader", () => {
  it("inclui o atalho para o mapa", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /^mapa$/i })).toHaveAttribute(
      "href",
      "/mapa",
    );
  });
});
