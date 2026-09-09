import type { Config } from "tailwindcss";

/**
 * Design System — HackTown
 * Dark mode neon. Estética blocky/modular, cantos retos, bordas finas e glows neon.
 * Paleta e tipografia definidas no Prompt 1 do projeto.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fundos
        bg: {
          base: "#0B0C10",
          surface: "#1F2833",
        },
        // Acentos neon
        neon: {
          green: "#CCFF00", // Acid Green (acento primário)
          magenta: "#FF007F", // Hot Magenta
          cyan: "#00FFFF", // Electric Cyan
        },
        // Textos
        text: {
          primary: "#FFFFFF",
          secondary: "#B0B3B8",
        },
        // Aliases semânticos para background/foreground padrão
        background: "#0B0C10",
        foreground: "#FFFFFF",
      },
      fontFamily: {
        // Display: títulos em uppercase/italic
        display: ["var(--font-display)", "Impact", "sans-serif"],
        // Corpo
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        button: "1.5px",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.1)",
      },
      boxShadow: {
        // Glow neon (usado em hover de botões e destaques)
        glow: "0 0 12px rgba(204,255,0,0.7), 0 0 24px rgba(204,255,0,0.4)",
        "glow-magenta":
          "0 0 12px rgba(255,0,127,0.7), 0 0 24px rgba(255,0,127,0.4)",
        "glow-cyan":
          "0 0 12px rgba(0,255,255,0.7), 0 0 24px rgba(0,255,255,0.4)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        // Letreiro infinito. A duração é sobrescrita inline via --marquee-duration.
        marquee: "marquee var(--marquee-duration, 20s) linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
