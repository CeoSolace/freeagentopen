/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7DFF',
          dark: '#1C5AD6'
        },
        secondary: {
          DEFAULT: '#9147FF',
          dark: '#752bcf'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};