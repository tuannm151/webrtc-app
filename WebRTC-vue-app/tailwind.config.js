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
    },
  },
  plugins: [require('daisyui')],
};
