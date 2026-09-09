import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendaComplete } from "@/components/onboarding/AgendaComplete";

describe("AgendaComplete", () => {
  it("oferece criar a próxima opção e comparar", async () => {
    const onCreateNext = jest.fn();
    const onFinish = jest.fn();
    const user = userEvent.setup();
    render(
      <AgendaComplete
        option={1}
        pickCount={3}
        onCreateNext={onCreateNext}
        onFinish={onFinish}
      />,
    );

    await user.click(screen.getByRole("button", { name: /criar opção 2/i }));
    expect(onCreateNext).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /comparar agendas/i }));
    expect(onFinish).toHaveBeenCalled();
  });

  it("na opção 3 só permite ir ao comparativo", () => {
    render(
      <AgendaComplete
        option={3}
        pickCount={2}
        onCreateNext={jest.fn()}
        onFinish={jest.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /criar opção/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /comparar agendas/i }),
    ).toBeInTheDocument();
  });
});
