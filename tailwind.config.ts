import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(0, 0%, 10%)',
        foreground: 'hsl(0, 0%, 100%)',
        card: {
          DEFAULT: 'hsl(0, 0%, 15%)',
          foreground: 'hsl(0, 0%, 100%)'
        },
        popover: {
          DEFAULT: 'hsl(0, 0%, 15%)',
          foreground: 'hsl(0, 0%, 100%)'
        },
        primary: {
          DEFAULT: 'hsl(0, 0%, 10%)',
          foreground: 'hsl(0, 0%, 100%)'
        },
        secondary: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(0, 0%, 10%)'
        },
        muted: {
          DEFAULT: 'hsl(0, 0%, 20%)',
          foreground: 'hsl(0, 0%, 80%)'
        },
        accent: {
          DEFAULT: 'hsl(120, 100%, 40%)',
          foreground: 'hsl(0, 0%, 10%)'
        },
        destructive: {
          DEFAULT: 'hsl(0, 100%, 50%)',
          foreground: 'hsl(0, 0%, 100%)'
        },
        border: 'hsl(0, 0%, 20%)',
        input: 'hsl(0, 0%, 20%)',
        ring: 'hsl(120, 100%, 40%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;