/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [{ pattern: /harmoni/ }],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        harmoni: {
          green:        '#1E4645',
          'green-dark': '#162F2E',
          'green-mid':  '#2A5B5A',
          'green-tint': '#E6EEEE',
          beige:        '#FBF9D8',
          'beige-dark': '#F0EDBB',
          black:        '#2D2D2D',
        },
      },
    },
  },
  plugins: [],
}
