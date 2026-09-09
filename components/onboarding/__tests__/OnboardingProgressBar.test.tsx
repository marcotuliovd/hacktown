import { render, screen } from "@testing-library/react";
import { OnboardingProgressBar, stepIndexFromPath } from "@/components/onboarding/OnboardingProgressBar";
import { resetOnboardingStore } from "@/store/onboarding-store";

jest.mock("next/navigation", () => ({
  usePathname: () => "/onboarding/opcao/1",
}));

describe("stepIndexFromPath", () => {
  it("mapeia as rotas do onboarding", () => {
    expect(stepIndexFromPath("/onboarding")).toBe(0);
    expect(stepIndexFromPath("/onboarding/opcao/1")).toBe(1);
    expect(stepIndexFromPath("/onboarding/opcao/2")).toBe(2);
    expect(stepIndexFromPath("/onboarding/opcao/3")).toBe(3);
    expect(stepIndexFromPath("/onboarding/comparar")).toBe(4);
  });
});

describe("OnboardingProgressBar", () => {
  beforeEach(() => {
    resetOnboardingStore();
  });

  it("destaca a etapa atual e expõe o progresso", () => {
    render(<OnboardingProgressBar />);
    expect(screen.getByText("Opção 1")).toHaveClass("text-neon-green");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });
});
