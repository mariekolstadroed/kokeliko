/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'special-elite': ["'Special Elite'", 'serif'],
      },
    },
  },
  plugins: [],
}

