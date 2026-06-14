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
          green:        '#034543',
          'green-dark': '#022E2D',
          'green-mid':  '#0A5F5C',
          'green-tint': '#EBF4F3',
          beige:        '#FFFBD5',
          'beige-mid':  '#F5F2BE',
          'beige-dark': '#EDE9A8',
          black:        '#282828',
        },
      },
    },
  },
  plugins: [],
}
