const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  //darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        inter: ['Libre Franklin'],
        sans: defaultTheme.fontFamily.sans
      },
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        ['background-light']: 'rgb(var(--color-background-light) / <alpha-value>)',
        ['background-bright']: 'rgb(var(--color-background-bright) / <alpha-value>)',
        ['background-dark']: 'rgb(var(--color-background-dark) / <alpha-value>)',

        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        ['primary-light']: 'rgb(var(--color-primary-light) / <alpha-value>)',
        ['primary-shadow']: 'rgb(var(--color-primary-shadow) / <alpha-value>)',

        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',

        white: 'rgb(var(--color-white) / <alpha-value>)',
        light: 'rgb(var(--color-light) / <alpha-value>)',
        black: 'rgb(var(--color-black) / <alpha-value>)',

        green: 'rgb(var(--color-green) / <alpha-value>)',
        red: 'rgb(var(--color-red) / <alpha-value>)',

        ['static-white']: 'rgb(var(--color-static-white) / <alpha-value>)'
      }
    }
  },
  variants: {
    extend: {}
  },
  safelist: ['text-green', 'text-red'],
  //plugins: [require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio'), require('@tailwindcss/typography'), require('@tailwindcss/line-clamp')]
  plugins: []
}
