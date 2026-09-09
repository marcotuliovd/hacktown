import { render, screen } from "@testing-library/react";
import { Marquee } from "@/components/ui/Marquee";

describe("Marquee", () => {
  it("renderiza o conteúdo do letreiro", () => {
    render(<Marquee>Últimas vagas para a keynote!</Marquee>);
    expect(
      screen.getAllByText(/últimas vagas para a keynote!/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("duplica o conteúdo para o loop contínuo", () => {
    render(<Marquee>ALERTA</Marquee>);
    // Uma cópia visível + uma aria-hidden = 2 ocorrências
    expect(screen.getAllByText("ALERTA")).toHaveLength(2);
  });

  it("aplica a classe de animação do marquee", () => {
    const { container } = render(<Marquee>Rolando</Marquee>);
    expect(container.querySelector(".animate-marquee")).toBeInTheDocument();
  });

  it("define a duração via CSS variable", () => {
    const { container } = render(
      <Marquee durationSeconds={12}>Rápido</Marquee>,
    );
    const track = container.querySelector(".animate-marquee") as HTMLElement;
    expect(track.style.getPropertyValue("--marquee-duration")).toBe("12s");
  });

  it("usa duração padrão de 20s quando não informada", () => {
    const { container } = render(<Marquee>Padrão</Marquee>);
    const track = container.querySelector(".animate-marquee") as HTMLElement;
    expect(track.style.getPropertyValue("--marquee-duration")).toBe("20s");
  });

  it("expõe role marquee com aria-label quando o conteúdo é texto", () => {
    render(<Marquee>Aviso importante</Marquee>);
    expect(screen.getByRole("marquee")).toHaveAttribute(
      "aria-label",
      "Aviso importante",
    );
  });
});
