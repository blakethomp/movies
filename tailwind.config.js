const defaultTheme = require('tailwindcss/defaultTheme')
// const ms = require('@tailwindcss-modularscale/index');

module.exports = {
  future: {
    purgeLayersByDefault: true,
  },
  purge: {
    layers: ['components', 'utilities'],
    content: ['./src/**/*.js'],
  },
  theme: {
    fontFamily: {
      body: ['"Tenor Sans"', 'sans-serif'],
      display: ['Limelight', 'sans-serif']
    },
    extend: {
    },
    screens: {
      ...defaultTheme.screens,
      xs: '520px',
      md: [
        {'min': '668px', 'max': '767px'},
        {'min': '868px'}
      ],
      sidebar: defaultTheme.screens.md
    }
  },
  variants: {},
  plugins: [
    require('tailwindcss-modularscale')({
      sizes: [
        { size: 'xs', value: -2 },
        { size: 'sm', value: -1 },
        { size: 'base', value: 0 },
        { size: 'lg', value: 1 },
        { size: 'xl', value: 2 },
        { size: '2xl', value: 3 },
        { size: '3xl', value: 4 },
      ],
      base:  1,
      ratio: 1.25,
      unit: 'rem',
    })
  ],
}
