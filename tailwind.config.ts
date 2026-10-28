import { heroui } from "@heroui/theme"

const brand = {
  primary: { DEFAULT: "#7b2ff2", foreground: "#ffffff" },
  secondary: { DEFAULT: "#2f6bff", foreground: "#ffffff" },
  success: { DEFAULT: "#16a36a", foreground: "#ffffff" },
  warning: { DEFAULT: "#e8a21a", foreground: "#17123a" },
  danger: { DEFAULT: "#e5484d", foreground: "#ffffff" },
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: { background: "#f4f5fb", foreground: "#17123a", ...brand },
        },
        dark: {
          colors: {
            background: "#0a0a0a",
            foreground: "#f5f5f5",
            ...brand,
            primary: { DEFAULT: "#146ef5", foreground: "#ffffff" },
            secondary: { DEFAULT: "#146ef5", foreground: "#ffffff" },
          },
        },
      },
    }),
  ],
}
