import config from "@/tailwind.config";

/**
 * Garante que o design system expõe os tokens definidos no Prompt 1.
 * Protege contra regressões acidentais na paleta e tipografia.
 */
describe("design system (tailwind theme)", () => {
  const colors = config.theme?.extend?.colors as Record<string, unknown>;
  const fontFamily = config.theme?.extend?.fontFamily as Record<
    string,
    string[]
  >;
  const boxShadow = config.theme?.extend?.boxShadow as Record<string, string>;

  it("define os fundos base e surface", () => {
    expect(colors.bg).toEqual({ base: "#0B0C10", surface: "#1F2833" });
  });

  it("define os acentos neon", () => {
    expect(colors.neon).toEqual({
      green: "#CCFF00",
      magenta: "#FF007F",
      cyan: "#00FFFF",
    });
  });

  it("define as cores de texto primário e secundário", () => {
    expect(colors.text).toEqual({
      primary: "#FFFFFF",
      secondary: "#B0B3B8",
    });
  });

  it("expõe as fontes display e sans via CSS variables", () => {
    expect(fontFamily.display[0]).toBe("var(--font-display)");
    expect(fontFamily.sans[0]).toBe("var(--font-sans)");
  });

  it("define um box-shadow de glow neon", () => {
    expect(boxShadow.glow).toContain("204,255,0");
  });

  it("usa dark mode por classe", () => {
    expect(config.darkMode).toBe("class");
  });
});
