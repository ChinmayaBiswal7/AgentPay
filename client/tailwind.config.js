/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paypal: {
          blue: '#0070BA',
          darkBlue: '#003087',
          lightBlue: '#00CFDE',
          yellow: '#FFC439',
        },
      },
    },
  },
  plugins: [],
}
