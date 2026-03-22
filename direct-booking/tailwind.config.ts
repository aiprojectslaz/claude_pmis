import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#faf7f2",
          100: "#f3ece0",
          200: "#e5d5be",
          300: "#d4b896",
          400: "#c09a6d",
          500: "#b08050",
          600: "#946843",
          700: "#785239",
          800: "#624432",
          900: "#51392b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
