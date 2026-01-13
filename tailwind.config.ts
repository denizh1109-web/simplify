import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        "app-bg": "#D3CCBF",
        surface: "#FFFFFF",
        "surface-2": "#D3CCBF",
        "border-subtle": "rgba(33, 33, 26, 0.14)",
        "gov-blue": "#000000",
        "gov-accent": "#8C7F70",
        "gov-brown": "#4A443B",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        display: [
          "var(--font-display)",
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
        ],
      },
    },
  },
};

export default config;
