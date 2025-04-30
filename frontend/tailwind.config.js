import {heroui} from "@heroui/theme"

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{ts,tsx,jsx,js}",
  ],
  theme: {
    extend: {
      animation: {
        move: "move 5s linear infinite",
        scroll: 'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        move: {
          "0%": { transform: "translateX(-200px)" },
          "100%": { transform: "translateX(200px)" },
        },
        scroll: {
          to: {
            transform: 'translate(calc(-50% - 0.5rem))',
          },
        },
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      fontFamily: {
        open: ['Open Sans', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          foreground: "#11181C",
          primary: {
            DEFAULT: "#6A0DB0",
          },
          secondary: {
            DEFAULT: "#1C1A3C",
          },
          blueViolet: {
            DEFAULT: "#3A2E60",
          },
          darkBlue: {
            DEFAULT: "#020618",
          },
        },
      },
      dark: {
        colors: {
          foreground: "#ECEDEE",
          primary: {
            DEFAULT: "#8C1AD9",
          },
          secondary: {
            DEFAULT: "#2C2A59",
          },
          blueViolet: {
            DEFAULT: "#2C2A59",
          },
          darkBlue: {
            DEFAULT: "#060826",
          },
        },
      }
    },
  }),],
}
