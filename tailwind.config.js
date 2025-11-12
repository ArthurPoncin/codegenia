/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E3350D",
          blue: "#3568D4",
          yellow: "#FFCC00",
          black: "#2C2C2C",
          gray: "#6B7280",
          white: "#FFFFFF",
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          800: "#1F2937",
        },
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.08)",
        lift: "0 12px 28px rgba(0,0,0,0.14)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
    extend: {},
  },
  plugins: [],
};
