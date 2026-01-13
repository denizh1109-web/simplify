import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        // Premium Light Theme (Ref 1: Travel/Modern)
        brand: {
          blue: "#0066FF",      // Vibrant CTA blue
          sky: "#F0F7FF",       // Soft background tint
          slate: "#64748B",     // De-emphasized text
        },
        // Premium Dark Theme (Ref 2: Fintech/Luxury)
        fintech: {
          dark: "#0B0E14",      // Deep background
          surface: "#161B22",   // Card background
          violet: "#8B5CF6",    // Neon purple accent
          neon: "#D946EF",      // Glow pink accent
        },
        // Light Mode Colors
        light: {
          bg: "#F8FAFC",        // Main background
          card: "#FFFFFF",      // Card surface
          border: "#E2E8F0",    // Soft border
          text: "#1E293B",      // Primary text
          muted: "#64748B",     // Secondary text
        },
      },
      borderRadius: {
        // The "Super-Ellipse" look
        card: "32px",           // Large outer cards
        inner: "18px",          // Buttons and nested elements
        pill: "9999px",         // Search bars and tags
      },
      boxShadow: {
        // Multi-layered soft shadows
        "soft-ui": "0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.02)",
        "neon-glow": "0 0 20px rgba(139, 92, 246, 0.3)",
        "depth": "0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 20px 60px -10px rgba(0, 0, 0, 0.02)",
      },
      backdropBlur: {
        glass: "12px",
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
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
};

export default config;
