import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza o conteúdo (children)", () => {
    render(<Button>Ver programação</Button>);
    expect(
      screen.getByRole("button", { name: /ver programação/i }),
    ).toBeInTheDocument();
  });

  it("aplica classes de borda neon, uppercase e cantos retos", () => {
    render(<Button>Ok</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("border-2");
    expect(btn).toHaveClass("uppercase");
    expect(btn).toHaveClass("rounded-none");
    expect(btn).toHaveClass("tracking-button");
    expect(btn).toHaveClass("border-neon-green");
  });

  it("usa type=button por padrão", () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("permite sobrescrever o type", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("dispara onClick ao ser clicado", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Clique</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("respeita o estado disabled e não dispara onClick", async () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Desabilitado
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("aplica a variante de cor escolhida", () => {
    render(<Button variant="magenta">Magenta</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-neon-magenta");
  });

  it("encaminha atributos extras (aria-label, className)", () => {
    render(
      <Button aria-label="fechar" className="w-full">
        X
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /fechar/i });
    expect(btn).toHaveClass("w-full");
  });

  it("renderiza como link interno quando href é informado", () => {
    render(<Button href="/programacao">Ver programação</Button>);
    expect(
      screen.getByRole("link", { name: /ver programação/i }),
    ).toHaveAttribute("href", "/programacao");
  });

  it("abre URLs externas em nova aba", () => {
    render(
      <Button href="https://www.google.com/maps">Como chegar</Button>,
    );
    const link = screen.getByRole("link", { name: /como chegar/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
