/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF1F3",
          100: "#FFE0E6",
          200: "#FFC2CE",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
          900: "#881337",
        },
        point: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        cream: "#FFF8F1",
        ink: "#2A1E1A",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 4px 18px -8px rgba(42, 30, 26, 0.12)",
        soft: "0 2px 12px -2px rgba(42, 30, 26, 0.10)",
        pop: "0 10px 30px -10px rgba(225, 29, 72, 0.45)",
      },
    },
  },
  plugins: [],
};
