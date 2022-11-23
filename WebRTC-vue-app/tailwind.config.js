/** @type {import('tailwindcss').Config} */
/* eslint-env node */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gray-transparent': 'rgba(0, 0, 0, 0.5)',
      },
      aspectRatio: {
        '4/3': '4 / 3',
      },
      gridTemplateColumns: {
        '3s': 'repeat(3, minmax(200px, 1fr))',
        fluid: 'repeat(auto-fill, minmax(0, 1fr))',
      },
      fontFamily: {
        mont: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
};
