import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        tiny: "340px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        brandYellow: "#F9B51E",
        brandRed: "#E10600",
      },
      fontFamily: {
        sans: ["var(--font-satoshi)"],
      },
      letterSpacing: {
        branded: "-7%",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
