/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Inspired by spotter.ai dark aesthetic
        background: "#0b0b10",
        foreground: "#e5e7eb",
        muted: "#16161d",
        primary: {
          DEFAULT: "#6d5efc", // electric indigo
          foreground: "#ffffff",
        },
        accent: "#00e6a8", // teal accent
      },
      borderRadius: {
        lg: "12px",
      },
    },
  },
  plugins: [],
};
