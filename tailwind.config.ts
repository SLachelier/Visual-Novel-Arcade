import type { Config } from "tailwindcss";
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xxs': '350px',
      'xs': '475px',
      ...defaultTheme.screens,
    },
    extend: { 
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
} satisfies Config;