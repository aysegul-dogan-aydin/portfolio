import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        mobile: "370px"
      },
      colors: {
        background: "#F4F2F0",
        primary: "#35423F",
        secondary: "#838D88"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  purge: {
    options: {
      safelist: [/^row-span-/]
    }
  },
  plugins: [require("tailwindcss-animate")]
};
export default config;
