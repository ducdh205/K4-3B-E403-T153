/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quiz: {
          dark: '#130924',
          panel: '#1e1435',
          card: '#291b47',
          border: '#3c2869',
          red: '#e21b3c',
          redHover: '#c91835',
          blue: '#1368ce',
          blueHover: '#0f52a5',
          yellow: '#d89e00',
          yellowHover: '#b58400',
          green: '#26890c',
          greenHover: '#1e6c0a',
          purple: '#8854c0',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

