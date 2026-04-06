import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lumify: {
          navy: "#001D7B",
          blue: "#4D78FF",
          muted: "#e8edf7",
          ink: "#0f172a",
        },
      },
      backgroundImage: {
        "lumify-mesh":
          "radial-gradient(ellipse 120% 80% at 50% -30%, rgba(77, 120, 255, 0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(0, 29, 123, 0.08), transparent 50%)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
