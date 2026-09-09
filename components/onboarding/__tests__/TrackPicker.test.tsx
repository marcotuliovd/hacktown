import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrackPicker } from "@/components/onboarding/TrackPicker";
import { resetOnboardingStore, useOnboardingStore } from "@/store/onboarding-store";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

const tracks = [
  { id: "ia", name: "Inteligência Artificial", code: "01" },
  { id: "saude", name: "Saúde e Bem-Estar", code: "17" },
];

describe("TrackPicker", () => {
  beforeEach(() => {
    mockPush.mockReset();
    resetOnboardingStore();
  });

  it("mantém Continuar desabilitado sem trilha selecionada", () => {
    render(<TrackPicker tracks={tracks} />);
    expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
  });

  it("permite seleção múltipla e habilita Continuar", async () => {
    const user = userEvent.setup();
    render(<TrackPicker tracks={tracks} />);

    const ia = screen.getByRole("button", { name: /inteligência artificial/i });
    const saude = screen.getByRole("button", { name: /saúde e bem-estar/i });

    await user.click(ia);
    await user.click(saude);

    expect(ia).toHaveAttribute("aria-pressed", "true");
    expect(saude).toHaveAttribute("aria-pressed", "true");
    expect(useOnboardingStore.getState().favoriteTrackIds).toEqual([
      "ia",
      "saude",
    ]);
    expect(screen.getByRole("button", { name: /continuar/i })).toBeEnabled();
  });

  it("navega para a opção 1 ao continuar", async () => {
    const user = userEvent.setup();
    render(<TrackPicker tracks={tracks} />);
    await user.click(
      screen.getByRole("button", { name: /inteligência artificial/i }),
    );
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(mockPush).toHaveBeenCalledWith("/onboarding/opcao/1");
  });
});
