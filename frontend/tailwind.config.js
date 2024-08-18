/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "320px",
      },
      colors:{
        "brand": "#0c4a6e"
      }
    },
  },
  plugins: [],
}
