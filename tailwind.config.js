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
          white: "#FFFFFF"
        },
        surface: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          800: "#1F2937"
        }
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 20% 15%, rgba(255, 204, 0, 0.28), transparent 55%), radial-gradient(circle at 80% 0%, rgba(53, 104, 212, 0.22), transparent 60%), radial-gradient(circle at 15% 85%, rgba(227, 53, 13, 0.18), transparent 62%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 60%)",
        "soft-grid":
          "linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px)"
      },
      backgroundSize: {
        "soft-grid": "36px 36px"
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.08)",
        lift: "0 12px 28px rgba(0,0,0,0.14)",
        glow: "0 0 0 1px rgba(255,204,0,0.35), 0 20px 45px rgba(53,104,212,0.25)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite"
      }
    }
  },
  plugins: []
};
